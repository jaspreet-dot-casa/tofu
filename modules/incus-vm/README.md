# Incus VM Module

Reusable OpenTofu module for creating and managing Incus virtual machines.

## Features

- Creates Incus VM instances with customizable resources (CPU, memory, disk)
- Supports cloud-init for automated configuration
- Flexible network attachment
- Additional device support (extra disks, etc.)
- Profile-based configuration

## Usage

```hcl
module "my_vm" {
  source = "../../modules/incus-vm"

  name         = "my-vm"
  image        = "images:debian/12/cloud"
  cpu_count    = 4
  memory_mb    = 8192
  disk_size_gb = 100
  storage_pool = "default"
  network_name = "incusbr0"

  cloud_init_user_data   = file("cloud-init-user.yaml")
  cloud_init_vendor_data = file("cloud-init-vendor.yaml")

  profiles = ["default"]

  additional_devices = {
    data_disk = {
      type = "disk"
      properties = {
        path = "/mnt/data"
        pool = "default"
        size = "50GiB"
      }
    }
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| name | VM instance name | `string` | n/a | yes |
| image | Incus image to use | `string` | `"images:debian/12/cloud"` | no |
| cpu_count | Number of CPU cores | `number` | `2` | no |
| memory_mb | Memory in MB | `number` | `2048` | no |
| disk_size_gb | Root disk size in GB | `number` | `20` | no |
| storage_pool | Incus storage pool | `string` | `"default"` | no |
| network_name | Incus network name | `string` | n/a | yes |
| cloud_init_user_data | Cloud-init user-data YAML | `string` | `""` | no |
| cloud_init_vendor_data | Cloud-init vendor-data YAML | `string` | `""` | no |
| profiles | List of Incus profiles | `list(string)` | `["default"]` | no |
| additional_devices | Additional devices to attach | `map(object)` | `{}` | no |

## Outputs

| Name | Description |
|------|-------------|
| instance_name | VM instance name |
| ipv4_address | VM IPv4 address |
| ipv6_address | VM IPv6 address |
| status | VM status |

## Notes

- Requires Incus provider configured
- Cloud-init requires cloud-enabled images (e.g., images:debian/12/cloud)
- Additional devices are dynamically created based on the map provided
