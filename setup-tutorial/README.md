# OpenTofu + Terragrunt + Incus Infrastructure Tutorial

Comprehensive guide for managing Incus VMs on Ubuntu using Infrastructure as Code (IaC) with OpenTofu and Terragrunt.

## What You'll Build

- **OMV NAS VM**: Dedicated storage server running OpenMediaVault 7.
- **ARR Stack VM**: Dedicated media automation server running the ARR stack (Sonarr, Radarr, etc.) in Docker.
- **NFS Integration**: High-performance network file sharing between the two VMs over the Incus bridge.

## Quick Start

1. **Prerequisites**: Ensure you have Ubuntu 24.04 LTS with virtualization support.
2. **Installation**: Follow [02-initial-setup.md](02-initial-setup.md) to install OpenTofu, Terragrunt, and Incus.
3. **Validation**: Run `../scripts/validate-prereqs.sh`.
4. **Deploy**: Start with [05-omv-nas-vm.md](05-omv-nas-vm.md) to deploy your storage backend.

## Tutorial Structure

1. [Prerequisites](01-prerequisites.md) - System requirements and hardware specs
2. [Initial Setup](02-initial-setup.md) - Install OpenTofu, Terragrunt, Incus
3. [Project Structure](03-project-structure.md) - Organize your IaC project
4. [Networking](04-networking.md) - Configure Incus networking
5. [OMV NAS VM](05-omv-nas-vm.md) - Deploy OpenMediaVault Storage Server **[START HERE]**
6. [ARR Stack VM](06-arr-stack-vm.md) - Deploy Media Automation Stack
   - [Monitoring Setup](06a-monitoring-setup.md) - Optional: Add Prometheus + Grafana monitoring
7. [Advanced Topics](07-advanced-topics.md) - Scaling, monitoring, CI/CD
8. [Troubleshooting](troubleshooting.md) - Common issues and solutions

## Project Layout

```
tofu/
├── modules/           # Reusable OpenTofu modules
├── environments/      # Environment-specific configurations
│   └── legion-ubuntu/ # Your host machine setup
│       ├── omv-vm/        # Storage VM config
│       └── arr-stack-vm/  # Media Stack VM config
├── templates/         # Cloud-init templates
├── scripts/           # Helper scripts
└── setup-tutorial/    # Step-by-step tutorial (this directory)
```

## Key Features

- **Split Architecture**: Decoupled Storage (OMV) and Compute (ARR) for better reliability and isolation.
- **Infrastructure as Code**: Full VM lifecycle management with OpenTofu.
- **DRY Configuration**: Terragrunt for reusable, modular infrastructure.
- **Automation**: Cloud-init and Ansible for zero-touch deployments.
- **Production-Ready Security**: UFW firewall, container UID isolation.
- **Reliability**: Health checks, resource limits, log rotation.

## Technologies

- **OpenTofu**: Open-source Terraform alternative
- **Terragrunt**: Terraform/OpenTofu wrapper for DRY configs
- **Incus**: Modern LXC/VM manager (LXD fork)
- **OpenMediaVault**: Network Attached Storage (NAS) solution
- **Docker Compose**: Container orchestration for ARR stack

## Contributing

This is a learning tutorial. Feel free to customize for your needs!

## License

See [LICENSE](LICENSE) for details.