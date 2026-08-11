/**
 * SQLite via `node:sqlite` — built into Node 24, so the runtime image needs no
 * compiler and no native module. WAL mode is on because Litestream replicates the
 * write-ahead log; without it the sidecar has nothing to stream.
 */

import { DatabaseSync, type SQLInputValue, type SQLOutputValue } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { env } from '$env/dynamic/private';

const DB_PATH = env.CCA_DB_PATH || './data/cca.db';

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new DatabaseSync(DB_PATH);

db.exec(`
	PRAGMA journal_mode = WAL;
	PRAGMA synchronous = NORMAL;
	PRAGMA foreign_keys = ON;
	PRAGMA busy_timeout = 5000;
`);

/**
 * Migrations run on boot, in order, guarded by user_version. Append only — never
 * edit a statement that has already shipped.
 */
const MIGRATIONS: string[] = [
	`
	CREATE TABLE profiles (
		id            TEXT PRIMARY KEY,
		created_at    TEXT NOT NULL,
		last_seen_at  TEXT NOT NULL
	);

	CREATE TABLE lesson_progress (
		profile_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
		lesson_id     TEXT NOT NULL,
		completed_at  TEXT NOT NULL,
		PRIMARY KEY (profile_id, lesson_id)
	);

	CREATE TABLE quiz_attempts (
		id             TEXT PRIMARY KEY,
		profile_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
		mode           TEXT NOT NULL,           -- 'mock' | 'domain' | 'scenario'
		target         TEXT,                    -- domain id or scenario id, null for mock
		question_ids   TEXT NOT NULL,           -- JSON array, fixes the order for the attempt
		started_at     TEXT NOT NULL,
		deadline_at    TEXT,                    -- mock mode only
		finished_at    TEXT,
		scaled_score   INTEGER,
		passed         INTEGER
	);
	CREATE INDEX idx_attempts_profile ON quiz_attempts(profile_id, started_at DESC);

	CREATE TABLE quiz_answers (
		attempt_id    TEXT NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
		question_id   TEXT NOT NULL,
		domain        TEXT NOT NULL,
		chosen        INTEGER,                  -- index into options, null while unanswered
		correct       INTEGER NOT NULL DEFAULT 0,
		flagged       INTEGER NOT NULL DEFAULT 0,
		answered_at   TEXT,
		PRIMARY KEY (attempt_id, question_id)
	);
	CREATE INDEX idx_answers_domain ON quiz_answers(domain, answered_at DESC);

	CREATE TABLE card_reviews (
		profile_id     TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
		card_id        TEXT NOT NULL,
		due_at         TEXT NOT NULL,
		interval_days  REAL NOT NULL DEFAULT 0,
		ease           REAL NOT NULL DEFAULT 2.5,
		reps           INTEGER NOT NULL DEFAULT 0,
		lapses         INTEGER NOT NULL DEFAULT 0,
		last_grade     TEXT,
		last_reviewed  TEXT,
		PRIMARY KEY (profile_id, card_id)
	);
	CREATE INDEX idx_cards_due ON card_reviews(profile_id, due_at);

	CREATE TABLE activity (
		profile_id  TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
		day         TEXT NOT NULL,              -- local YYYY-MM-DD
		lessons     INTEGER NOT NULL DEFAULT 0,
		questions   INTEGER NOT NULL DEFAULT 0,
		cards       INTEGER NOT NULL DEFAULT 0,
		PRIMARY KEY (profile_id, day)
	);
	`,
	// The quiz and flashcard features were removed: this is a study tracker, not a
	// mock-exam engine. Their tables and the activity counters that fed them go with
	// them. `lessons` is the only kind of activity there is now.
	`
	DROP TABLE IF EXISTS quiz_answers;
	DROP TABLE IF EXISTS quiz_attempts;
	DROP TABLE IF EXISTS card_reviews;

	ALTER TABLE activity DROP COLUMN questions;
	ALTER TABLE activity DROP COLUMN cards;
	`
];

function migrate(): void {
	const row = db.prepare('PRAGMA user_version').get() as { user_version: number };

	for (let i = row.user_version; i < MIGRATIONS.length; i++) {
		const statements = MIGRATIONS[i];
		if (statements === undefined) continue;

		db.exec('BEGIN');
		try {
			db.exec(statements);
			db.exec(`PRAGMA user_version = ${i + 1}`);
			db.exec('COMMIT');
		} catch (err) {
			db.exec('ROLLBACK');
			throw new Error(`migration ${i + 1} failed: ${(err as Error).message}`, { cause: err });
		}
	}
}

migrate();

/**
 * Bind and result types come from `node:sqlite` itself rather than being restated
 * here, so they cannot drift from the driver. Typing parameters this way moves the
 * error to the call site: `run(sql, new Date())` no longer compiles, and
 * `flagged ? 1 : 0` becomes a requirement instead of a convention.
 *
 * Input and output differ deliberately — SQLite accepts any ArrayBufferView but
 * only ever hands back a Uint8Array.
 */
export type SqlValue = SQLInputValue;

/** What SQLite can hand back for a column. */
export type SqlRow = Record<string, SQLOutputValue>;

/**
 * `node:sqlite` returns null-prototype objects, which SvelteKit's serializer
 * refuses to send to the browser. Everything leaving this module is copied into a
 * plain object so callers never have to think about it.
 */
function plain(row: object): SqlRow {
	return { ...row } as SqlRow;
}

/**
 * Row generics are constrained to shapes SQLite can genuinely produce, so a caller
 * cannot assert a `Date` or a nested object out of a column. Where a query result
 * needs to become a domain type (booleans, unions, parsed JSON), decode it in the
 * owning module rather than widening this constraint.
 */
export function get<T extends SqlRow>(sql: string, ...params: SqlValue[]): T | undefined {
	const row = db.prepare(sql).get(...params);
	return row === undefined ? undefined : (plain(row) as T);
}

export function all<T extends SqlRow>(sql: string, ...params: SqlValue[]): T[] {
	return db.prepare(sql).all(...params).map((row) => plain(row) as T);
}

export function run(sql: string, ...params: SqlValue[]): void {
	db.prepare(sql).run(...params);
}

/**
 * Runs `fn` in a transaction, rolling back if it throws.
 *
 * SQLite rejects a nested BEGIN, so nesting uses SAVEPOINTs — that way a helper
 * wrapped in `tx()` stays safe to call from inside another `tx()`.
 */
let txDepth = 0;

export function tx<T>(fn: () => T): T {
	const depth = txDepth;
	const savepoint = `sp_${depth}`;

	// Opened BEFORE the depth is claimed: if BEGIN itself throws (a busy timeout,
	// say), an increment outside the try/finally would never be undone and every
	// later top-level transaction would run as a savepoint instead.
	db.exec(depth === 0 ? 'BEGIN' : `SAVEPOINT ${savepoint}`);
	txDepth++;

	try {
		const result = fn();
		db.exec(depth === 0 ? 'COMMIT' : `RELEASE ${savepoint}`);
		return result;
	} catch (err) {
		// `ROLLBACK TO` rewinds but leaves the savepoint on SQLite's stack — without the
		// RELEASE, an outer transaction that catches and carries on accumulates one dead
		// savepoint per failed nested tx().
		db.exec(depth === 0 ? 'ROLLBACK' : `ROLLBACK TO ${savepoint}; RELEASE ${savepoint}`);
		throw err;
	} finally {
		txDepth--;
	}
}

