/**
 * The question bank, organised by scenario because that is how the exam draws: four
 * scenarios out of six, roughly fifteen questions each. Every question also carries a
 * domain, so domain drills are just a filter across the whole bank.
 *
 * The by-domain and by-scenario groupings are built once at module load rather than
 * re-scanning the bank on every call — the same pattern the other lookup tables use.
 */

import type { DomainId } from '../domains';
import type { ScenarioId } from '../scenarios';
import type { Question } from './types';

import { support } from './support';
import { codeGen } from './code-gen';
import { research } from './research';
import { devtools } from './devtools';
import { cicd } from './ci-cd';
import { extraction } from './extraction';

export type { Question, Option, Options } from './types';

export const QUESTIONS: readonly Question[] = [
	...support,
	...codeGen,
	...research,
	...devtools,
	...cicd,
	...extraction
];

export const QUESTION_BY_ID: ReadonlyMap<string, Question> = new Map(
	QUESTIONS.map((q) => [q.id, q])
);

function groupBy<K extends string>(key: (q: Question) => K): ReadonlyMap<K, readonly Question[]> {
	const groups = new Map<K, Question[]>();
	for (const question of QUESTIONS) {
		const bucket = groups.get(key(question));
		if (bucket) bucket.push(question);
		else groups.set(key(question), [question]);
	}
	return groups;
}

const BY_SCENARIO = groupBy<ScenarioId>((q) => q.scenario);
const BY_DOMAIN = groupBy<DomainId>((q) => q.domain);

export function questionsForScenario(scenario: ScenarioId): readonly Question[] {
	return BY_SCENARIO.get(scenario) ?? [];
}

export function questionsForDomain(domain: DomainId): readonly Question[] {
	return BY_DOMAIN.get(domain) ?? [];
}

export function questionCount(): number {
	return QUESTIONS.length;
}
