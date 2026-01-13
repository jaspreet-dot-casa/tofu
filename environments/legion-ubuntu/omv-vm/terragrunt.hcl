include "root" {
  path = find_in_parent_folders()
}

include "env" {
  path = find_in_parent_folders("env.hcl")
}

dependency "network" {
  config_path = "../networking"

  mock_outputs = {
    network_name = "incusbr0"
  }
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
}

terraform {
  source = "${get_parent_terragrunt_dir()}/modules//incus-vm"
}

locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

inputs = {
  name         = "omv-vm"
  image        = local.env_vars.locals.default_image
  cpu_count    = 2
  memory_mb    = 4096
  disk_size_gb = 50
  storage_pool = local.env_vars.locals.storage_pool

  network_name = dependency.network.outputs.network_name

  cloud_init_vendor_data = file("${get_terragrunt_dir()}/cloud-init-vendor.yaml")
  cloud_init_user_data   = file("${get_terragrunt_dir()}/cloud-init-user.yaml")

  # Additional storage for NAS data
  additional_devices = {
    nas_data = {
      type = "disk"
      properties = {
        path = "/srv/dev-disk-by-uuid-nas"
        pool = local.env_vars.locals.storage_pool
        size = "500GiB"
      }
    }
  }

  profiles = [local.env_vars.locals.default_profile]
}
