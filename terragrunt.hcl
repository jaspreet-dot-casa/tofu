# Root-level configuration for all environments
locals {
  # Project-wide settings
  project_name = "legion-infra"
}

# Local state backend (simple, single-user setup)
remote_state {
  backend = "local"
  config = {
    path = "${get_parent_terragrunt_dir()}/${path_relative_to_include()}/terraform.tfstate"
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# Generate provider configuration for Incus
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<EOF
terraform {
  required_version = ">= 1.6"

  required_providers {
    incus = {
      source  = "lxc/incus"
      version = "~> 0.3.1"
    }
  }
}

provider "incus" {
  # Connect to local Incus daemon via Unix socket
  # Uses default socket at /var/lib/incus/unix.socket
}
EOF
}
