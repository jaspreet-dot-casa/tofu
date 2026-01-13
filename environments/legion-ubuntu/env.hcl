locals {
  environment = "legion-ubuntu"
  host_name   = "legion-ubuntu"

  # Network configuration
  network_name    = "incusbr0"
  network_cidr    = "10.100.0.0/24"
  network_gateway = "10.100.0.1"

  # Common VM settings
  default_image   = "images:debian/12/cloud"
  default_profile = "default"

  # Storage configuration
  storage_pool    = "default"
  storage_backend = "lvm"

  # Tags for organization
  common_tags = {
    managed_by  = "opentofu"
    environment = "legion-ubuntu"
  }
}
