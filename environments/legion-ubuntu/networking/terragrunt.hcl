include "root" {
  path = find_in_parent_folders()
}

include "env" {
  path = find_in_parent_folders("terragrunt.hcl")
}

terraform {
  source = "${get_parent_terragrunt_dir()}/modules//incus-network"
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

inputs = {
  network_name = local.env_vars.locals.network_name
  ipv4_cidr    = local.env_vars.locals.network_cidr
  nat_enabled  = true
  dns_domain   = "legion.local"
}
