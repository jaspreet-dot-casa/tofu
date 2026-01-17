netup:
	@docker network inspect vpn >/dev/null 2>&1  || docker network create vpn
	@docker network inspect vpn >/dev/null 2>&1 && echo "vpn network is up" || echo "vpn network is down"
	@docker network inspect dashboard >/dev/null 2>&1  ||  docker network create dashboard
	@docker network inspect dashboard >/dev/null 2>&1 && echo "dashboard network is up" || echo "dashboard network is down"
