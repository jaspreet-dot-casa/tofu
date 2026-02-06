# Arcane Setup

## Initial Configuration

1. Generate `.env` file (if not already done):
```bash
echo "PROJECTS_DIRECTORY=$(cd .. && pwd)" >> .env && docker run --rm ghcr.io/getarcaneapp/arcane:latest /app/arcane generate secret | grep '=' >> .env
```

This sets `PROJECTS_DIRECTORY` and generates `ENCRYPTION_KEY` and `JWT_SECRET`.

**NOTE:** Only run once. Running again will regenerate keys.

2. Deploy:
```bash
docker compose up -d
```

## Access

- Via Traefik: `https://arcane.glorzo.jaspreet.casa` (built-in auth)
- Direct: `http://localhost:3552` (fallback)
