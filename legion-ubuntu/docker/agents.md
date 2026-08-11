# Docker Homelab Stack — Agent Reference

Primary working directory: `/home/tagpro/workspace/tofu/legion-ubuntu/docker`

## Stack Overview

Homelab Docker stack running on an Ubuntu server (legion-ubuntu). All services sit behind **Traefik v3** with Let's Encrypt TLS via Cloudflare DNS-01 challenge. Authentication is provided by **TinyAuth** backed by **Pocket ID** OIDC SSO.

- **Base domain**: `glorzo.jaspreet.casa`
- **PUID/PGID**: 1000/1000
- **Timezone**: Australia/Melbourne

---

## Services & Subdomains

| Directory    | Subdomain                              | Auth              | Notes |
|--------------|----------------------------------------|-------------------|-------|
| `proxy/`     | `traefik.glorzo.jaspreet.casa`         | tinyauth          | Traefik dashboard, TinyAuth, Pocket ID |
| `proxy/`     | `auth.glorzo.jaspreet.casa`            | none (public)     | Pocket ID OIDC provider |
| `proxy/`     | `tinyauth.glorzo.jaspreet.casa`        | none (self)       | TinyAuth UI |
| `vpnstack/`  | `mediamanager.glorzo.jaspreet.casa`    | tinyauth          | Media manager (VPN-routed) |
| `vpnstack/`  | `cine.glorzo.jaspreet.casa`            | built-in          | Media manager; intended MediaManager replacement. Shares gluetun's netns (all traffic VPN-only), so its port + Traefik router live on the gluetun service. SQLite + Litestream |
| `vpnstack/`  | `qbit.glorzo.jaspreet.casa`            | tinyauth          | qBittorrent (VPN-routed) |
| `vpnstack/`  | `prowlarr.glorzo.jaspreet.casa`        | tinyauth          | Indexer manager (VPN-routed) |
| `jellyfin/`  | `jellyfin.glorzo.jaspreet.casa`        | built-in          | NVIDIA GPU accelerated |
| `ollama/`    | `ai.glorzo.jaspreet.casa`              | none (no tinyauth)| LLM API, NVIDIA GPU accelerated; unauthenticated by design for API/CLI use, relies on Traefik being VPN-only |
| `openwebui/` | `chat.glorzo.jaspreet.casa`            | built-in          | Chat UI for Ollama; own login, no tinyauth |
| `plex/`      | host network port 32400                | built-in          | Plex (host network, no Traefik) |
| `immich/`    | `immich.glorzo.jaspreet.casa`          | built-in          | Photo management |
| `gopodder/`  | `gopodder.glorzo.jaspreet.casa`        | built-in          | gPodder-compatible podcast sync server; local SQLite, Litestream-replicated |
| `sftpgo/`    | `sftp.glorzo.jaspreet.casa`            | tinyauth          | Web UI; SFTP on port 2022 |
| `glances/`   | `glances.glorzo.jaspreet.casa`         | tinyauth          | System monitoring |
| `dashboards/`| `home.glorzo.jaspreet.casa`            | tinyauth          | Homepage dashboard |
| `dashboards/`| `dashboard.glorzo.jaspreet.casa`       | tinyauth          | Homarr dashboard |
| `arcane/`    | `arcane.glorzo.jaspreet.casa`          | built-in          | Docker management UI |
| `boxbox/`    | `boxbox.glorzo.jaspreet.casa`          | tinyauth          | Web file manager |
| `webhost/`   | `web.glorzo.jaspreet.casa`             | none (public)     | Static site hosting; Caddy serves a host dir (`SITE_PATH`), directory browsing on |
| `claude/cca/`| `cca.glorzo.jaspreet.casa`             | none (anon cookie)| Claude Certified Architect exam prep. **Built from source** in `claude/cca/app/` (SvelteKit, adapter-node). No login by design — progress keys off a signed anonymous cookie that doubles as a cross-device sync code. SQLite via `node:sqlite` + Litestream |

---

## Docker Networks

Three external networks created via `make netup` / `just netup`:

| Network     | Purpose |
|-------------|---------|
| `proxy`     | All Traefik-routed services join this network |
| `vpn`       | VPN-isolated services (vpnstack) |
| `dashboard` | Dashboard services |

---

## Architecture Patterns

### Directory structure per service
```
<service>/
  compose.yml      # Docker Compose definition
  .env             # Active config (gitignored)
  .env.example     # Template committed to git
  .gitignore       # Always excludes .env
  README.md        # Optional service notes
```

### Traefik labels pattern (auth-protected service)
```yaml
labels:
  - "traefik.enable=true"
  - "traefik.docker.network=proxy"
  - "traefik.http.routers.<service>.rule=Host(`<subdomain>.${DOMAIN}`)"
  - "traefik.http.routers.<service>.entrypoints=websecure"
  - "traefik.http.routers.<service>.tls=true"
  - "traefik.http.services.<service>.loadbalancer.server.port=<port>"
  - "traefik.http.routers.<service>.middlewares=tinyauth@docker"
```

For services with built-in auth (arcane, jellyfin), replace the last label with `security-headers@file` or omit tinyauth entirely.

### .env.example pattern
```env
TZ=Australia/Melbourne
DOMAIN=example.com
PUID=1000
PGID=1000
# service-specific vars below
```

### Network declaration in compose.yml
```yaml
networks:
  proxy:
    name: proxy
    external: true
```

---

## Authentication

- **TinyAuth** (`tinyauth@docker` middleware) gates most services
- **Pocket ID** is the OIDC provider at `auth.glorzo.jaspreet.casa`
- TinyAuth is configured with `OAUTH_AUTO_REDIRECT=pocketid` — unauthenticated requests go straight to Pocket ID
- Services that ship their own auth (Arcane, Jellyfin, Plex) do NOT use the tinyauth middleware
- Ollama is also exposed without tinyauth (it's consumed as a raw API, and tinyauth's OIDC redirect breaks non-browser clients); it relies on Traefik only being reachable over VPN
- Open WebUI is exposed without tinyauth too, relying on its own built-in login (same exemption pattern as jellyfin/arcane)

---

## Proxy / TLS

- Traefik listens on `:80` (redirects to HTTPS) and `:443`
- Wildcard cert for `*.glorzo.jaspreet.casa` via Cloudflare DNS-01
- `certificatesresolvers.letsencrypt` — cert resolver name used in labels
- Dynamic config in `proxy/config/dynamic/` (middlewares, certs)

---

## Adding a New Service

1. `mkdir <service> && cd <service>`
2. Create `compose.yml` — join `proxy` network, add Traefik labels, no exposed ports
3. Create `.env` (copy from `.env.example`, fill in secrets)
4. Create `.env.example` with placeholder values
5. Create `.gitignore` containing `.env`
6. Add to both `Makefile` and `justfile` `compose-up` / `compose-down` targets

---

## Management

```bash
make netup          # Create Docker networks
make compose-up     # Start all services
make compose-down   # Stop all services

just netup          # Same, using justfile
just compose-up
just compose-down
```

---

## Host Firewall (UFW)

Open ports managed via `make ufw-setup`:
- 22/tcp — SSH
- 80/tcp — Traefik HTTP
- 443/tcp — Traefik HTTPS
- 2022/tcp — SFTPGo SFTP
- 8096/tcp, 8920/tcp — Jellyfin
- 1900/udp, 7359/udp — Jellyfin discovery
- 32400/tcp — Plex
- 53317/tcp — LocalSend
