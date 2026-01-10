# Incus Storage Module

Reusable OpenTofu module for creating and managing Incus storage pools.

## Features

- Creates storage pools with various drivers
- Supports LVM, btrfs, directory, and ZFS backends
- Flexible configuration options

## Usage

```hcl
module "storage" {
  source = "../../modules/incus-storage"

  pool_name   = "vm-storage"
  pool_driver = "lvm"

  pool_config = {
    size = "300GiB"
  }
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| pool_name | Storage pool name | `string` | n/a | yes |
| pool_driver | Storage driver | `string` | `"lvm"` | no |
| pool_config | Storage pool configuration | `map(string)` | `{}` | no |
| prevent_destroy | Prevent accidental destruction of the storage pool (recommended for production) | `bool` | `true` | no |

## Outputs

| Name | Description |
|------|-------------|
| pool_name | Storage pool name |
| pool_id | Storage pool ID |
| pool_driver | Storage pool driver |

## Notes

- Requires Incus provider configured
- In most cases, storage pools are created during `incus admin init` and don't need this module
- This module is useful for creating additional storage pools
