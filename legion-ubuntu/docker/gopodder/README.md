# gopodder

Self-hosted [gPodder](https://github.com/cbrgm/gopodder)-compatible podcast sync server.
Routed via Traefik at `gopodder.${DOMAIN}`, no tinyauth — it has its own admin login
(created on first visit, same exemption pattern as jellyfin/arcane).

## Database

Local **SQLite** file at `${GOPODDER_DATA_PATH}/gopodder.db` (on ssd2).

gopodder's sqlite driver (`modernc.org/sqlite`) is a local-file driver — it cannot
talk to Turso/libSQL, and a `libsql://` URL in `GOPODDER_DB_PATH` is treated as a
filename and fails. The only backends gopodder accepts are `sqlite` and `postgres`.

## Backups (Litestream)

A `litestream` sidecar continuously replicates the SQLite WAL to
`${GOPODDER_BACKUP_PATH}` on a **separate physical disk**. Config in `litestream.yml`:
daily snapshots, 30-day retention.

### Restore

```bash
# Stop the writer first so nothing is holding the DB open.
docker compose stop gopodder

# Restore the latest replica into place.
docker compose run --rm --no-deps litestream \
  restore -config /etc/litestream.yml -o /data/gopodder.db /data/gopodder.db

docker compose up -d
```

Restore into a scratch file first (`-o /data/restore-test.db`) if you want to verify
before overwriting the live database.
