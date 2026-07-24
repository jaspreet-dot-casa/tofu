# webhost

Dead-simple static site hosting. A `caddy:alpine` container serves the contents
of a host directory as a website at `web.glorzo.jaspreet.casa`, behind Traefik.

- **Public** — no TinyAuth. Anyone with the URL can view it.
- **Instant** — Caddy reads files off disk per request. Drop a file into the
  served directory and it's live immediately; no restart, no rebuild.
- **Directory browsing** — folders without an `index.html` render a clickable
  file listing (`file_server browse`).

## Served directory

Set by `SITE_PATH` in `.env` (default `/home/tagpro/websites`), bind-mounted
read-only into the container at `/srv`.

```
SITE_PATH/
  index.html        -> https://web.glorzo.jaspreet.casa/
  foo.html          -> https://web.glorzo.jaspreet.casa/foo.html
  demo/             -> https://web.glorzo.jaspreet.casa/demo/  (listing or its index.html)
```

## Usage

```bash
mkdir -p /home/tagpro/websites
echo '<h1>hello</h1>' > /home/tagpro/websites/index.html

docker compose up -d          # from this directory
```

Then visit https://web.glorzo.jaspreet.casa.

## Config

- `Caddyfile` — serves `/srv`, gzip/zstd compression, directory browsing.
- `.env` — `DOMAIN` and `SITE_PATH` (copy from `.env.example`).

## Notes

- TLS is terminated by Traefik (wildcard `*.glorzo.jaspreet.casa`); Caddy speaks
  plain HTTP on `:80` with its own auto-HTTPS disabled.
- To make the site **private**, add `tinyauth@docker` to the router's
  `middlewares` label in `compose.yml`.
- To **disable directory listings**, change `file_server browse` to
  `file_server` in the `Caddyfile`.
