# RustDesk server (OSS)

Self-hosted ID (`hbbs`) and relay (`hbbr`) servers for RustDesk. Tailscale first,
home LAN as the fallback. Nothing is exposed to the internet.

No Traefik: RustDesk speaks raw TCP/UDP, not HTTP. `rustdesk.glorzo.jaspreet.casa`
is just a DNS name; the `*.glorzo` wildcard already points it at the Tailscale IP.

| Port      | Proto   | Service | Purpose                          |
|-----------|---------|---------|----------------------------------|
| 21115     | TCP     | hbbs    | NAT type test                    |
| 21116     | TCP+UDP | hbbs    | ID registration, hole punching   |
| 21117     | TCP     | hbbr    | Relay                            |

21118/21119 (web client) are not published.

## Deploy

```bash
docker compose up -d
cat data/id_ed25519.pub   # the Key every client needs
```

The first start generates the key pair in `data/`. **Back up `data/id_ed25519*`.**
Lose the pair and every client has to be re-keyed. `data/` is gitignored.

## Client settings

Settings → Network → ID/Relay server:

| Field        | Value                                                    |
|--------------|----------------------------------------------------------|
| ID server    | `rustdesk.glorzo.jaspreet.casa` (Tailscale)              |
| Relay server | *(blank)*                                                |
| API server   | *(blank)*                                                |
| Key          | contents of `data/id_ed25519.pub`                        |

Leave **Relay blank**. `hbbs` has no `-r`, so each client relays via the host
it used for the ID server, on port 21117. That one rule is what lets the
Tailscale and LAN paths share one server.

**LAN fallback** (Tailscale down on legion): change only the ID server to
`192.168.68.74`. That is the wired NIC; give it a DHCP reservation. Keep the same
key. The router's DNS doesn't resolve `legion-ubuntu`, so use the IP.

**legion's own RustDesk client** points at `legion-ubuntu`, which resolves to
`127.0.1.1`. Keep that: it stays registered whatever state Tailscale or the LAN is
in. Host-local traffic reaches hbbs via the Docker gateway IP, so hole punching
to legion fails. Remote sessions into legion fall back to the relay, which runs on
legion itself, so the cost is nil.

## Why not `network_mode: host`

Upstream recommends host mode so hbbs sees real client IPs. Here that isn't needed.
With Docker's iptables backend, published ports are DNAT'd and keep the client
source IP for anything arriving over Tailscale or the LAN.
