# Initial setup

Arcane requires some initial setup before it can be used. Follow these steps to get started:

## 1. Generate .env file

Run this command to create your `.env` file with the correct configuration:

```bash
echo "PROJECTS_DIRECTORY=$(cd .. && pwd)" >> .env && docker run --rm ghcr.io/getarcaneapp/arcane:latest /app/arcane generate secret | grep '=' >> .env
```

This will:
- Set `PROJECTS_DIRECTORY` to the absolute path of the parent directory (docker directory)
- Generate and append `ENCRYPTION_KEY` and `JWT_SECRET`

NOTE: Only run this command once. If you run it again, it will regenerate new keys and overwrite your existing configuration.
