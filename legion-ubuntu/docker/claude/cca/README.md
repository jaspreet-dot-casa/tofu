# CCA Prep

Study app for the **Claude Certified Architect – Foundations (CCA-F)** exam, at
`cca.${DOMAIN}`. Built from source in `app/` — SvelteKit 2 / Svelte 5 on adapter-node.

A study tracker, not a mock-exam engine. Chapters mapped onto the exam's own weighted
blueprint, a playbook for each production scenario the paper draws from, a curated resource
list, and a progress bar over the chapters you have read. It deliberately does not simulate
the exam or score you — the only thing it measures is how much of the curriculum you have
been through.

## Running it

```bash
cp .env.example .env   # then fill in the paths and generate COOKIE_SECRET
docker compose up -d --build
```

`COOKIE_SECRET` signs the anonymous profile cookie. Generate one with:

```bash
openssl rand -base64 48
```

Keep it stable once set — study history is keyed on the profile id inside that cookie, so
changing the secret invalidates every existing cookie and mints fresh (empty) profiles.

## How identity works

There is no login. On first visit the app mints a random UUID, signs it, and sets it as an
httpOnly cookie. All progress keys off that id. `/profile` surfaces the raw id as a **sync
code** — paste it into another browser to adopt the same history there. That is device sync
without an auth system, which is the right trade for a single-user homelab app that holds
nothing but a study record.

The site is deliberately **not** behind TinyAuth: it has no login of its own to conflict
with, holds nothing sensitive, and Traefik is only reachable over the VPN.

## Data and backup

SQLite at `/data/cca.db` in WAL mode, replicated continuously by the Litestream sidecar to
`${CCA_BACKUP_PATH}` — the same pattern as `gopodder/`. Keep the backup path on a different
physical disk to the data path.

No native modules: `node:sqlite` ships with Node 24, so the runtime image is a plain
`node:24-alpine` with no build toolchain.

### Directory ownership

The app runs as the image's `node` user, **uid 1000**, and `/data` is a bind mount — so the
`chown` in the Dockerfile applies to the image layer, not to the mounted directory. Create
both host paths owned by uid 1000 before the first `up`, or the first boot fails trying to
create the database:

```bash
sudo install -d -o 1000 -g 1000 "$CCA_DATA_PATH" "$CCA_BACKUP_PATH"
```

### Restoring

Litestream refuses to overwrite an existing file, and writes the restored copy as root —
so the obvious one-liner does not work. Verified sequence:

```bash
docker compose stop cca
```

```bash
sudo mv "$CCA_DATA_PATH/cca.db" "$CCA_DATA_PATH/cca.db.bak" && sudo rm -f "$CCA_DATA_PATH"/cca.db-wal "$CCA_DATA_PATH"/cca.db-shm
```

`--no-deps` matters: without it, `depends_on` starts `cca` again and it opens the database
you are mid-way through replacing.

```bash
docker compose run --rm --no-deps litestream restore -config /etc/litestream.yml /data/cca.db
```

```bash
sudo chown 1000:1000 "$CCA_DATA_PATH/cca.db" && docker compose up -d cca
```

Keep `cca.db.bak` until you have confirmed the restored history looks right.

To rehearse a restore without touching the live database, write to a scratch path instead —
this is safe to run at any time, including while the app is up:

```bash
docker compose run --rm --no-deps --entrypoint sh litestream -c 'litestream restore -config /etc/litestream.yml -o /tmp/check.db /data/cca.db && ls -l /tmp/check.db'
```

## Authoring content

Chapters are markdown in `app/src/content/lessons/*.md`, rendered to HTML **once at server
boot** — a few dozen files that never change at runtime, so per-request parsing would be
waste. The filename is the URL slug.

Frontmatter:

```yaml
---
id: d4-tool-anatomy          # stable id used by progress rows; defaults to the filename
track: d4                    # orientation | d1 | d2 | d3 | d4 | d5
order: 1                     # position within the track
title: Tool anatomy and the description lever
summary: One line for card and index views.
minutes: 7
courseChapter: tooling       # optional; a key from app/src/lib/data/course.ts
---
```

Callouts are `markdown-it-container` blocks, so they render as plain styled HTML with no
JavaScript involved:

```markdown
::: key-fact Optional custom title
Body text.
:::

::: trap
Body text.
:::

::: exam-tip
Body text.
:::
```

Scenario playbooks live in `app/src/content/scenarios/<scenario-slug>.md` (no frontmatter;
the slug must match `app/src/lib/data/scenarios.ts`).

## Sources

The curriculum is built from the official exam guide plus the community-maintained
[candidate guide](https://github.com/paullarionov/claude-certified-architect/blob/main/guide_en.md),
which is where the eight-scenario pool and the conversational-architecture briefing come
from. That guide is candidate-sourced rather than official — treat its claims as leads to
verify against the Anthropic docs, not as settled fact.

## Local development

```bash
cd app && npm install && npm run dev
```

Set `ORIGIN` when running the built server outside Docker, or SvelteKit rejects every form
POST as cross-site:

```bash
ORIGIN=http://127.0.0.1:3000 CCA_DB_PATH=./data/cca.db node build
```

## Fonts

Bricolage Grotesque, JetBrains Mono and Literata are subset and committed to
`app/static/fonts/`, so the container makes no runtime font requests. All three are SIL
OFL 1.1; the licence and the per-family copyright notices are in
`app/static/fonts/OFL.txt`, which must stay alongside the `.woff2` files — the OFL
requires it to travel with any redistribution, and this repo is public.

## Sourcing

The official exam guide lives behind Anthropic's Partner Academy. The lessons here are a
synthesis of the public blueprint, the freeCodeCamp/ExamPro course, and the Claude and MCP
documentation; the questions are written in the exam's style and are **not** real exam
items. `/resources` says so on the site and links the official guide as the source of truth.
