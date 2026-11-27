# Arcane Setup

Arcane v3 (`ghcr.io/getarcaneapp/manager:v3`) behind Traefik. Upstream docs:
https://getarcane.app/docs/get-started/installation

## Fresh install

1. Create `.env` from `.env.example`, then fill in the projects directory and a new key:
```bash
cp .env.example .env
sed -i "s|^ARCANE_PROJECTS_DIRECTORY=.*|ARCANE_PROJECTS_DIRECTORY=$(cd .. && pwd)|" .env
docker run --rm ghcr.io/getarcaneapp/manager:v3 /app/arcane generate secret
```
Put the generated value in `ARCANE_ENCRYPTION_KEY`. **Never change it afterwards:**
secrets stored in the database are encrypted with it.

2. Deploy and grab the initial admin password (only created on an empty database):
```bash
docker compose up -d
docker compose cp arcane:/app/data/initial-admin-password .
```

## Upgrading from 2.x to v3 (one time)

v3 needs a database from **2.17.3** or later; older ones must run 2.17.3 once first
([migration guide](https://getarcane.app/docs/get-started/migrate-v3)).
`.env` must already use the v3 names from `.env.example`, with
`ARCANE_ENCRYPTION_KEY` set to the **old** `ENCRYPTION_KEY` value.

1. Back up the data volume (rollback = restore this and the 2.x `.env`):
```bash
docker compose down
docker run --rm -v arcane_arcane-data:/data -v "$HOME":/backup alpine \
  tar czf /backup/arcane-data-pre-v3.tgz -C /data .
```

2. Start v3:
```bash
docker compose pull && docker compose up -d
docker compose logs -f arcane
```

3. Afterwards: everyone is logged out (v3 signs sessions with a new key); re-check
custom roles and re-create notifications under System → Notifications. Delete
`.env.v1.bak` (the 2.x `.env`) once v3 is confirmed working.

## Access

- Via Traefik: `https://arcane.glorzo.jaspreet.casa` (built-in auth + Pocket ID OIDC)
- Direct: `http://localhost:3552` (fallback)
