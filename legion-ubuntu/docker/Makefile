.PHONY: ufw-setup
ufw-setup:
	sudo ufw allow 22/tcp comment 'SSH'
	sudo ufw allow 80/tcp comment 'Traefik HTTP'
	sudo ufw allow 443/tcp comment 'Traefik HTTPS'
	sudo ufw allow 2022/tcp comment 'SFTPGo SFTP'
	sudo ufw allow 8096/tcp comment 'Jellyfin HTTP'
	sudo ufw allow 8920/tcp comment 'Jellyfin HTTPS'
	sudo ufw allow 1900/udp comment 'Jellyfin DLNA discovery'
	sudo ufw allow 7359/udp comment 'Jellyfin client discovery'
	sudo ufw allow 32400/tcp comment 'Plex'
	sudo ufw allow 53317/tcp comment 'LocalSend'
	@echo "UFW rules configured. Enable with: sudo ufw enable"

.PHONY: netup
netup:
	docker network inspect proxy >/dev/null 2>&1  || docker network create proxy
	docker network inspect proxy >/dev/null 2>&1 && echo "proxy network is up" || echo "proxy network is down"
	docker network inspect vpn >/dev/null 2>&1  || docker network create vpn
	docker network inspect vpn >/dev/null 2>&1 && echo "vpn network is up" || echo "vpn network is down"
	docker network inspect dashboard >/dev/null 2>&1  ||  docker network create dashboard
	docker network inspect dashboard >/dev/null 2>&1 && echo "dashboard network is up" || echo "dashboard network is down"

.PHONY: compose-down
compose-down:
	cd arcane && docker compose down
	cd dashboards && docker compose down
	cd filebrowser && docker compose down
	cd glances && docker compose down
	cd immich && docker compose down
	cd jellyfin && docker compose down
	cd plex && docker compose down
	cd sftpgo && docker compose down
	cd vpnstack && docker compose down
	cd proxy && docker compose down

.PHONY: compose-up
compose-up:
	cd proxy && docker compose up -d --wait
	cd sftpgo && docker compose up -d
	cd vpnstack && docker compose up -d
	cd plex && docker compose up -d
	cd jellyfin && docker compose up -d
	cd glances && docker compose up -d
	cd immich && docker compose up -d
	cd filebrowser && docker compose up -d
	cd dashboards && docker compose up -d
	cd arcane && docker compose up -d
