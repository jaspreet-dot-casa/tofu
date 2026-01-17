## Pre-requisite

1. Ensure the external networks exist by running from the parent directory:
```bash
make netup
```

2. Copy the environment file and configure it:
```bash
cp .env.example .env
```

Then add the frontend URL to the `HOMEPAGE_ALLOWED_HOSTS` variable in the `.env` file.
