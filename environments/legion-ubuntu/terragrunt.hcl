# Include root configuration
include "root" {
  path = find_in_parent_folders()
}

# Load environment variables
locals {
  env_vars = read_terragrunt_config(find_in_parent_folders("env.hcl"))
}

# Common inputs for all units in this environment
inputs = {
  environment = local.env_vars.locals.environment
  host_name   = local.env_vars.locals.host_name
  common_tags = local.env_vars.locals.common_tags
}
