# Infrastructure as Code

This repository contains all Infrastructure as Code (IaC) configurations for managing infrastructure using OpenTofu and Terragrunt.

## Structure

- **modules/** - Reusable OpenTofu modules for infrastructure components
- **environments/** - Environment-specific configurations and deployments
- **templates/** - Cloud-init and configuration templates
- **scripts/** - Utility scripts for infrastructure management
- **setup-tutorial/** - Complete setup guide and tutorials

## Getting Started

If you're new to this setup, check out the [Setup Tutorial](setup-tutorial/README.md) for a comprehensive guide on:
- Installing OpenTofu v1.11+, Terragrunt v0.97+, and Incus v6.0+
- Configuring infrastructure modules
- Deploying a complete media server VM (OpenMediaVault + ARR stack)
- Managing infrastructure with Infrastructure as Code

## Technologies

- **OpenTofu** - Open-source Terraform alternative
- **Terragrunt** - DRY wrapper for OpenTofu/Terraform
- **Incus** - Modern LXC/VM manager

## Quick Commands

```bash
# Validate prerequisites
./scripts/validate-prereqs.sh

# Initialize and deploy (from environment directory)
cd environments/<environment-name>
terragrunt init
terragrunt plan
terragrunt apply
```

For detailed instructions, see the [Setup Tutorial](setup-tutorial/README.md).
