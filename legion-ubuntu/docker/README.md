# Docker Media Stack

Media server stack with Traefik reverse proxy and Pocket ID SSO authentication.

## Quick Start

```bash
# Create networks
just netup

# Deploy all services
just compose-up
```

## Service Access

All services accessible via `https://<service>.${DOMAIN}`:
- `home` - Homepage dashboard (Pocket ID auth)
- `mediamanager` - Media library management (Pocket ID auth)
- `qbit` - qBittorrent downloads (Pocket ID auth)
- `prowlarr` - Indexer management (Pocket ID auth)
- `jellyfin` - Jellyfin media server (built-in auth, NVIDIA GPU accelerated)
- `ai` - Ollama LLM API (no auth, NVIDIA GPU accelerated, VPN-only Traefik access)
- `chat` - Open WebUI chat interface for Ollama (built-in auth)
- `sftp` - SFTPGo file transfer (Pocket ID auth, SFTP on port 2022)
- `boxbox` - Web file manager (Pocket ID auth)
- `arcane` - Docker management (built-in auth)
- `dashboard` - Homarr dashboard (Pocket ID auth)
- `traefik` - Traefik dashboard (Pocket ID auth)
- `auth` - Pocket ID authentication

Plex remains on host network (unchanged).

## First-Time Setup

1. Follow individual README files in each directory for initial configuration
2. Deploy services: `just compose-up`
3. Configure Pocket ID: Access `https://auth.${DOMAIN}` and create admin account

## Management

```bash
just                 # List all recipes
just netup           # Create Docker networks
just compose-up      # Start all services
just compose-down    # Stop all services
```

## Container logging

Log size is capped daemon-wide, not per service. `daemon.json` sets the `json-file`
driver to `max-size: 50m` / `max-file: 3`, bounding every container on the host to
150 MB — including any started outside these compose files.

```bash
just docker-logging-setup
```

This exists because an uncapped log once filled the root disk: `mediamanager_server`
lost its Postgres connection, its taskiq broker retried with no backoff, and the
resulting traceback spam grew a single log file to 567 GB. Nothing truncates a
`json-file` log by default, so a crash-looping container will consume the disk.

The recipe **merges** into any existing `/etc/docker/daemon.json` (backing it up
first) rather than overwriting it — this host registers the NVIDIA container runtime
there, and Jellyfin and Ollama stop seeing the GPU if that key is lost. It validates
with `dockerd --validate` but does not restart Docker; apply with
`sudo systemctl restart docker` when a full container restart is acceptable.

Caps apply to **newly created** containers, so existing ones pick this up when next
recreated. An already-oversized log file has to be deleted by hand.

See individual directories for detailed setup:
- `/proxy` - Traefik + Pocket ID
- `/vpnstack` - Cinephage, qBittorrent, Prowlarr (VPN-routed). MediaManager is
  parked behind the `mediamanager` compose profile and no longer starts by default.
- `/dashboards` - Homepage, Homarr
- `/sftpgo` - SFTPGo file transfer server
- `/boxbox` - Web file manager
- `/arcane` - Docker management
- `/jellyfin` - Jellyfin media server (NVIDIA hardware acceleration)
- `/ollama` - Ollama LLM API (NVIDIA hardware acceleration)
- `/openwebui` - Open WebUI chat interface for Ollama
- `/plex` - Plex media server

Notes:
- The Base URL is set in .env.global file as `DOMAIN`.
