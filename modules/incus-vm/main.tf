resource "incus_instance" "vm" {
  name    = var.name
  image   = var.image
  type    = "virtual-machine"

  # VM resources
  limits = {
    cpu    = var.cpu_count
    memory = "${var.memory_mb}MiB"
  }

  # Root disk configuration
  device {
    name = "root"
    type = "disk"
    properties = {
      path = "/"
      pool = var.storage_pool
      size = "${var.disk_size_gb}GiB"
    }
  }

  # Network configuration
  device {
    name = "eth0"
    type = "nic"
    properties = {
      network = var.network_name
    }
  }

  # Cloud-init configuration
  config = {
    "cloud-init.user-data"   = var.cloud_init_user_data
    "cloud-init.vendor-data" = var.cloud_init_vendor_data
  }

  # Additional devices (optional)
  dynamic "device" {
    for_each = var.additional_devices
    content {
      name       = device.key
      type       = device.value.type
      properties = device.value.properties
    }
  }

  profiles = var.profiles
}
