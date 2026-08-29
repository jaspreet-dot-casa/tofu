.PHONY: setup host-setup install check bootstrap

setup:
	echo "$(shell whoami) ALL=(ALL) NOPASSWD: /usr/bin/apt, /usr/bin/apt-get" | sudo tee /etc/sudoers.d/nopasswd-apt
	sudo chmod 440 /etc/sudoers.d/nopasswd-apt

host-setup:
	ansible-playbook --connection=local host-setup.yml -K

install:
	ansible-playbook --connection=local startup-playbook.yml -K

check:
	ansible-playbook --connection=local startup-playbook.yml --check

bootstrap: host-setup install
