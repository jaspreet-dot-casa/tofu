# Incus Network Module

Reusable OpenTofu module for creating and managing Incus networks.

## Features

- Creates managed network bridges
- Configurable IPv4/IPv6 addressing
- NAT configuration
- DNS domain settings

## Usage

```hcl
module "network" {
  source = "../../modules/incus-network"

  network_name = "incusbr0"
  ipv4_cidr    = "10.100.0.1/24"
  nat_enabled  = true
  dns_domain   = "legion.local"
}
```

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| network_name | Network name | `string` | n/a | yes |
| ipv4_cidr | IPv4 CIDR (e.g., 10.100.0.1/24) | `string` | n/a | yes |
| ipv6_enabled | Enable IPv6 | `bool` | `false` | no |
| ipv6_cidr | IPv6 CIDR | `string` | `""` | no |
| nat_enabled | Enable NAT | `bool` | `true` | no |
| dns_domain | DNS domain | `string` | `"local"` | no |

## Outputs

| Name | Description |
|------|-------------|
| network_name | Network name |
| network_id | Network ID |
| ipv4_gateway | IPv4 gateway address |

## Notes

- Requires Incus provider configured
- Creates a managed bridge with DHCP enabled by default
- NAT allows VMs to access the internet through the host
