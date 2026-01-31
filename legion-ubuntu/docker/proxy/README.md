# Proxy Stack - Traefik + Pocket ID

Reverse proxy with SSL certificates and centralized authentication.

## Setup

```bash
# From parent directory
make netup

# Deploy
docker compose up -d
```

## First-Time Configuration

1. Access Pocket ID: `https://auth.${DOMAIN}`
2. Create admin account
3. Add user accounts as needed

## Environment Variables

The `.env` file is pre-configured with:
- `DOMAIN` - Your domain address
- `ACME_EMAIL` - Let's Encrypt notifications
- `POCKETID_DB_PASSWORD` - Database password (already generated)

## Access

- Traefik dashboard: `https://traefik.${DOMAIN}`
- Pocket ID: `https://auth.${DOMAIN}`
