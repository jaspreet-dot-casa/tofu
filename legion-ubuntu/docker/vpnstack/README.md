# VPNStack

It is a set of docker containers that uses the VPN connection to route traffic from other containers through the VPN. There are a lot of use cases for this.

## Media Manager with Prowlarr, qBittorrent, and a nordvpn wireguard connection

We are following the guide from https://maximilian-dorninger.gitbook.io/mediamanager/installation-guide to set up MediaManager.

### Step one
We need to setup the wireguard VPN connection first along with MEDIA_PATH variable in .env file.

```bash
cp .env.example .env
```
- Add the MEDIA_PATH to where you'd like to store your media files.
- You also need to setup openvpn or wireguard VPN connection variables in the .env file.

For Nord VPN wireguard configuration, follow the instructions in [nordvpn.md](nordvpn.md) file in this directory to get the necessary variables.

### Step two
You need to create these directories
- media directories for MediaManager
- qbittorrent/downloads directory for qbittorrent to save downloads

```bash
# I like to put things in it's own media path so it does't mess with existing files.
# You can add this path as well in your plex media library settings if you want plex to see these files.
source .env  # load MEDIA_PATH variable from .env file
mkdir -p $MEDIA_PATH/qbittorrent/downloads
mkdir -p $MEDIA_PATH/mediamanager/{images,tv,movies}
```

### Step three
Once you have this directory cloned locally, follow step two [from the guide](https://maximilian-dorninger.gitbook.io/mediamanager/installation-guide#prepare-configuration-directory-and-example-config) above to setup config.toml for MediaManager.

Go through the entire file and make the necessary changes for your setup.
Here is what I changed in my config.toml:
- In the [misc] section,
  - I changed frontend_url and cors_urls to use port 13000 instead of 8000, since we will be running MediaManager's frontend on port 13000.
  - I also updated cors_urls to include my local setup which includes tailscale and localhost URLs.
- In the [[misc.tv_libraries]] section, I changed the path to /data/TV Shows to match where my TV shows are stored.
- In the [[misc.movie_libraries]] section, I changed the path to /data/Movies to match where my movies are stored.
- In the [auth] section, I generated a random token_secret using "openssl rand -hex 32" and set it accordingly.
- In the [auth] section, I set admin_emails to ["<my-email@address.com>"].
- In the [torrents] section, I set the qbittorrent settings. For qbittorrent password,
  - `docker compose up qbittorrent` first to start the qbittorrent container.
  - You'll see a temporary password in the logs in the terminal. Copy that. Username is `admin`.
  - Then go to `http://localhost:13001` to set the qbittorrent web UI password.
  - Change the password to something secure. You can set the password in Settings -> Web UI. Click Save after       changing the password.
  - After setting the password, update the config.toml file with the same password.
  - `Ctrl+C` to stop the container.
- In the [indexers.prowlarr] section, I set the prowlarr settings. For prowlarr api_key,
  - `docker compose up prowlarr` first to start the prowlarr container.
  - Then go to `http://localhost:9696` to access the prowlarr web UI and create your account.
  - Go to Settings -> General and copy the API Key from there.
  - After getting the API key, update the config.toml file with the same API key.
  - While you have the prowlarr webUI open, add these indexers:
    - LimeTorrents
    - The Pirate Bay
    - Nyaa.si (for anime)
    - YTS (Might need to update the URL to a working one if the default doesn't work)
    - `Ctrl+C` to stop the container.

### Step four

Now that you have your config.toml file ready, and env variables setup, you can start the containers.

```bash
docker compose up -d
```

Go to `http://localhost:13000` to access the MediaManager web UI.

## Traefik Access

After deploying the proxy stack, services are accessible via:
- MediaManager: `https://mediamanager.${DOMAIN}` (Pocket ID auth)
- Cinephage: `https://cine.${DOMAIN}` (own login)
- qBittorrent: `https://qbit.${DOMAIN}` (Pocket ID auth)
- Prowlarr: `https://prowlarr.${DOMAIN}` (Pocket ID auth)

Direct port access (`localhost:13000`, etc.) remains available as fallback.

## Cinephage

Intended replacement for MediaManager. It rolls the Radarr/Sonarr/Prowlarr/Bazarr
roles into one process, so it needs neither Prowlarr nor Postgres — it has its own
indexer engine and a local SQLite database. Both stacks currently run side by side;
nothing is removed until Cinephage has proven itself.

### Networking

Cinephage runs with `network_mode: service:gluetun`, so **all** of its traffic —
indexer searches, TMDB metadata, downloads — leaves over the VPN, and it loses network
entirely if the tunnel drops. Because it shares gluetun's network namespace it has no
interface of its own, which is why its published port (`13002:3000`) and its Traefik
router both live on the **gluetun** service rather than on `cinephage`.

Verify egress at any time — this must not print your home IP:

```bash
docker exec cinephage node -e "fetch('https://ipinfo.io/json').then(r=>r.json()).then(d=>console.log(d.ip,d.city,d.org))"
```

### Database and backups

Live SQLite at `${CINEPHAGE_CONFIG_PATH}/data/cinephage.db` (on ssd2), with a
`litestream` sidecar continuously replicating the WAL to `${CINEPHAGE_BACKUP_PATH}` on a
**separate physical disk**. Same pattern as gopodder; config in `cinephage-litestream.yml`.

Restore:

```bash
# Stop the writer first so nothing is holding the DB open.
docker compose stop cinephage

docker compose run --rm --no-deps cinephage-litestream \
  restore -config /etc/litestream.yml -o /config/data/cinephage.db /config/data/cinephage.db

docker compose up -d
```

### First run

1. Open `https://cine.${DOMAIN}` and create the admin account.
2. Settings → add a **TMDB API key** (free, from themoviedb.org). Metadata does not
   work without it.
3. Settings → Download Clients → add qBittorrent at `http://localhost:13001`. It is
   `localhost` and not `gluetun` because both containers share gluetun's namespace.
   Cinephage sees downloads at `/downloads`, the exact path qBittorrent reports, so no
   remote path mapping is needed.
4. Add root folders (below), then run a library scan.

### Importing the existing library

`/mnt/hdd1/media` is mounted at `/media` — the same tree Jellyfin serves — so Cinephage
sees every library through one mount. That also means it can **hardlink** on import
instead of copying: `/media/*` and `/downloads` are all on the same filesystem.

Cinephage identifies existing files by reading TMDB/TVDB ids straight out of the folder
name, which is exactly how MediaManager already named things (`[tmdbid-1668]`,
`{tvdb-348545}`). Those match by direct id lookup; untagged folders (`Breaking Bad`,
`127 Hours`) fall back to fuzzy title+year matching and may need a manual nudge under
Library → Unmatched.

Root folders to add:

| Path                       | Type   | Notes                                     |
|----------------------------|--------|-------------------------------------------|
| `/media/movies`            | movie  | 243 hand-curated titles Jellyfin serves   |
| `/media/tv`                | tv     | 27 shows Jellyfin serves                  |
| `/media/mediamanager/movies` | movie | 83 titles MediaManager manages            |
| `/media/mediamanager/tv`   | tv     | 25 shows MediaManager manages             |

**Mark the two `mediamanager/*` folders read-only** while both stacks are live. A
read-only root folder is catalogued but never written to, so the two apps cannot fight
over the same files. Once MediaManager is retired, either clear the read-only flag or
move that content into `/media/movies` and `/media/tv` and drop the folders.
