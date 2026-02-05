## Setup

1. Ensure networks exist:
```bash
make netup
```

2. Configure environment (if not already done):
```bash
cp .env.example .env
# Update HOMEPAGE_ALLOWED_HOSTS and DOMAIN in .env
```

3. Deploy:
```bash
docker compose up -d
```

## Access

- Via Traefik: `https://home.glorzo.jaspreet.casa` (Pocket ID auth)
- Direct: `http://localhost:15000` (fallback)
