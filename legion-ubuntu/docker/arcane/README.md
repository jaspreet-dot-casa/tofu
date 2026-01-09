# Initial setup

Arcane requires some initial setup before it can be used. Follow these steps to get started:

The bash command creates a secrets.env file with two essential environment variables: ENCRYPTION_KEY and JWT_SECRET.

NOTE: Only run this command once. This script intentionally creates new keys each time so even if you run it by mistake, you will not lose the previous keys. Just remove the new keys if it was unintentional.

```bash
echo "# Generated on $(date '+%Y-%m-%d %H:%M:%S')" >> secrets.env
  docker run --rm ghcr.io/getarcaneapp/arcane:latest /app/arcane generate secret | grep '=' >> secrets.env
```
