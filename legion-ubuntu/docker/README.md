# Docker Media Stack

Media server stack with Traefik reverse proxy and Pocket ID SSO authentication.

## Quick Start

```bash
# Create networks
make netup

# Deploy all services
make compose-up
```

## Service Access

All services accessible via `https://<service>.${DOMAIN}`:
- `home` - Homepage dashboard (Pocket ID auth)
- `mediamanager` - Media library management (Pocket ID auth)
- `qbit` - qBittorrent downloads (Pocket ID auth)
- `prowlarr` - Indexer management (Pocket ID auth)
- `jellyfin` - Jellyfin media server (built-in auth, NVIDIA GPU accelerated)
- `sftp` - SFTPGo file transfer (Pocket ID auth, SFTP on port 2022)
- `boxbox` - Web file manager (Pocket ID auth)
- `arcane` - Docker management (built-in auth)
- `dashboard` - Homarr dashboard (Pocket ID auth)
- `traefik` - Traefik dashboard (Pocket ID auth)
- `auth` - Pocket ID authentication

Plex remains on host network (unchanged).

## First-Time Setup

1. Follow individual README files in each directory for initial configuration
2. Deploy services: `make compose-up`
3. Configure Pocket ID: Access `https://auth.${DOMAIN}` and create admin account

## Management

```bash
make compose-up      # Start all services
make compose-down    # Stop all services
```

See individual directories for detailed setup:
- `/proxy` - Traefik + Pocket ID
- `/vpnstack` - MediaManager, qBittorrent, Prowlarr (VPN-routed)
- `/dashboards` - Homepage, Homarr
- `/sftpgo` - SFTPGo file transfer server
- `/boxbox` - Web file manager
- `/arcane` - Docker management
- `/jellyfin` - Jellyfin media server (NVIDIA hardware acceleration)
- `/plex` - Plex media server

Notes:
- The Base URL is set in .env.global file as `DOMAIN`.
