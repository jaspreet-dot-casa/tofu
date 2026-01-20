# Project Structure and Configuration

This guide explains how to organize your Infrastructure as Code project with OpenTofu and Terragrunt.

## Directory Structure

```
tofu/
├── README.md                          # Main documentation
├── .gitignore                         # Git exclusions
├── terragrunt.hcl                     # Root Terragrunt config
│
├── setup-tutorial/                    # Tutorial documentation
│   ├── 01-prerequisites.md
│   ├── 02-initial-setup.md
│   ├── 03-project-structure.md       # You are here
│   ├── 04-networking.md
│   ├── 05-omv-nas-vm.md
│   ├── 06-arr-stack-vm.md
│   ├── 07-advanced-topics.md
│   └── troubleshooting.md
│
├── modules/                           # Reusable OpenTofu modules
│   ├── incus-vm/                     # Generic VM module
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── README.md
│   ├── incus-network/                # Network module
│   └── incus-storage/                # Storage module
│
├── environments/                      # Environment-specific configs
│   └── legion-ubuntu/                # Your host machine
│       ├── env.hcl                   # Environment variables
│       ├── terragrunt.hcl            # Host-level config
│       ├── networking/               # Network infrastructure
│       ├── omv-vm/                   # OpenMediaVault NAS VM
│       └── arr-stack-vm/             # Media Stack VM (Docker)
│
├── templates/                         # Reusable templates
└── scripts/                           # Helper scripts
    └── validate-prereqs.sh
```

## Design Principles

### 1. Separation of Concerns (Split VM Architecture)

This project uses a "Split VM" architecture:
- **`omv-vm/`**: Handles storage, disk management, and file sharing (NFS/SMB).
- **`arr-stack-vm/`**: Handles compute-intensive media automation (Sonarr, Radarr, etc.).

**Benefits:**
- **Isolation**: If the media stack crashes or consumes all CPU, your NAS storage remains stable.
- **Flexibility**: You can upgrade or replace the media stack without touching your storage data.
- **Security**: Granular control over permissions; the media stack only mounts what it needs.

### 2. DRY (Don't Repeat Yourself)

Terragrunt helps avoid repetition:
- Root config generates provider and backend for all modules
- Environment config sets common variables
- Modules are reused across VMs

## Configuration Files Explained

### Root `terragrunt.hcl`

Located at project root, this file:

**Purpose**: Define global settings for all environments

**Key sections**:

```hcl
# Project-wide settings
locals {
  project_name = "legion-infra"
}

# State backend configuration
remote_state {
  backend = "local"  # Using local state for simplicity
  config = {
    path = "${get_parent_terragrunt_dir()}/terraform.tfstate"
  }
}

# Auto-generate provider configuration
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.6"

  required_providers {
    incus = {
      source  = "lxc/incus"
      version = "~> 1.0.2"
    }
  }
}

provider "incus" {
  # Connect to local Incus via Unix socket
}
EOF
}
```

### Environment `env.hcl`

Located at `environments/legion-ubuntu/env.hcl`

**Purpose**: Store environment-specific variables

```hcl
locals {
  environment = "legion-ubuntu"

  # Network settings
  network_name = "incusbr0"
  network_cidr = "10.100.0.1/24"

  # VM defaults
  default_image   = "images:debian/12/cloud"
  default_profile = "default"
  storage_pool    = "default"

  # Tags
  common_tags = {
    managed_by  = "opentofu"
    environment = "legion-ubuntu"
  }
}
```

### Unit `terragrunt.hcl`

Located at `environments/legion-ubuntu/arr-stack-vm/terragrunt.hcl` (example)

**Purpose**: Define a specific piece of infrastructure

```hcl
# Include parent configs
include "root" {
  path = find_in_parent_folders()
}

include "env" {
  path = find_in_parent_folders("terragrunt.hcl")
}

# Define dependencies
dependency "network" {
  config_path = "../networking"
  mock_outputs = { network_name = "incusbr0" }
}

# Reference the module
terraform {
  source = "${get_parent_terragrunt_dir()}/modules//incus-vm"
}

# Load environment vars
locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

# Set inputs for the module
inputs = {
  name         = "arr-stack-vm"
  cpu_count    = 4
  memory_mb    = 8192
  disk_size_gb = 100
  # ... more inputs
}
```

## Module Structure

Each module in `modules/` follows this pattern:

- **`main.tf`**: Defines resources (VMs, networks, etc.)
- **`variables.tf`**: Defines input variables
- **`outputs.tf`**: Defines output values
- **`README.md`**: Documentation

## Workflow

### 1. Initialize a Unit

```bash
cd environments/legion-ubuntu/omv-vm
terragrunt init
```

### 2. Plan Changes

```bash
terragrunt plan
```

### 3. Apply Changes

```bash
terragrunt apply
```

### 4. Run for All Units

```bash
# From environments/legion-ubuntu/
terragrunt run-all apply
```

Processes all units in dependency order (Network -> OMV/ARR).

## Next Steps

Now that you understand the project structure, proceed to:

- [Networking Setup](04-networking.md) - Deploy network infrastructure
- [OMV NAS VM](05-omv-nas-vm.md) - Deploy your storage server

## Summary

This project structure provides:
- **Modularity**: Reusable modules for common patterns
- **Organization**: Clear separation between storage (OMV) and compute (ARR)
- **DRY Configuration**: Variables defined once, used everywhere
- **Dependency Management**: Automatic ordering of deployments