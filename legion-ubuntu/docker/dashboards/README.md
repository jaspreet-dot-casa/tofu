## Setup

1. Ensure networks exist:
```bash
make netup
```

2. Configure environment (if not already done):
```bash
cp .env.example .env
# Update HOMEPAGE_ALLOWED_HOSTS and DOMAIN in .env
# Generate Homarr encryption key: openssl rand -hex 32
```

3. Deploy:
```bash
docker compose up -d
```

## Access

### Homepage
- Via Traefik: `https://home.${DOMAIN}`
- Direct: `http://localhost:15000` (fallback)

### Homarr
- Via Traefik: `https://dashboard.${DOMAIN}` (tinyauth SSO)
