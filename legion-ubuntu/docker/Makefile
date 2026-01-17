.PHONY: netup
netup:
	@docker network inspect vpn >/dev/null 2>&1  || docker network create vpn
	@docker network inspect vpn >/dev/null 2>&1 && echo "vpn network is up" || echo "vpn network is down"
	@docker network inspect dashboard >/dev/null 2>&1  ||  docker network create dashboard
	@docker network inspect dashboard >/dev/null 2>&1 && echo "dashboard network is up" || echo "dashboard network is down"

compose-down:
	cd arcane && docker compose down
	cd dashboards && docker compose down
	cd plex && docker compose down
	cd vpnstack && docker compose down

compose-up:
	cd vpnstack && docker compose up -d
	cd plex && docker compose up -d
	cd dashboards && docker compose up -d
	cd arcane && docker compose up -d
