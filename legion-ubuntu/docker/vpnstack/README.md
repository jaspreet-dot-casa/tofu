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

## WIP

Configure the tailscale service to allow MediaManager to access media files over Tailscale securely without reverse proxy setup.

https://tailscale.com/kb/1552/tailscale-services
