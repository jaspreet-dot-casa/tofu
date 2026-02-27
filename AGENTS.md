# AGENTS.md

## Project Overview

This repository manages infrastructure for a home server (Legion Ubuntu host).

## Conventions

- **Package management**: Use `brew` (Homebrew) to install packages on the host.
- **Host configuration**: Host files are maintained with Ansible.

## Directory Structure

- `tofu/` — OpenTofu configurations for the host.
- `ansible/` — Ansible playbooks for host provisioning and configuration.
- `docker/` — Docker Compose stacks running on the host.
- `k8s/` — Kubernetes manifests for a single-node cluster (evolving as we learn).
