# Networking Setup

This guide covers configuring Incus networking for your VMs using OpenTofu and Terragrunt.

## Network Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Host Machine                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │            incusbr0 (Bridge)                      │  │
│  │         10.100.0.1/24 (Gateway)                   │  │
│  │         NAT enabled                               │  │
│  └──────────────────────┬───────────────────────────┘  │
│            ┌────────────┴────────────┐                 │
│     ┌──────▼────────┐         ┌──────▼────────┐        │
│     │    omv-vm     │         │  arr-stack-vm │        │
│     │ (Storage/NAS) │         │ (Media Apps)  │        │
│     │  10.100.0.x   │         │  10.100.0.y   │        │
│     └───────────────┘         └───────────────┘        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │              Physical NIC (eth0)                  │  │
│  │              Internet Connection                  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          │
                          │
                    [Internet]
```

## Network Configuration

### Default Network (incusbr0)

The network was created during `incus admin init`:

- **Name**: incusbr0
- **Type**: Managed bridge
- **CIDR**: 10.100.0.1/24
- **Gateway**: 10.100.0.1
- **DHCP**: Enabled (automatic IP assignment)
- **NAT**: Enabled (VMs can access internet)
- **DNS**: Automatic (dnsmasq)

### IP Address Range

- **Network**: 10.100.0.0/24
- **Gateway**: 10.100.0.1
- **Usable IPs**: 10.100.0.2 - 10.100.0.254 (253 hosts)
- **Broadcast**: 10.100.0.255

## OpenTofu Network Module

The network is managed by the `incus-network` module located at `modules/incus-network/`.

### Module Inputs

| Variable | Description | Default | 
|----------|-------------|---------|
| network_name | Network name | - |
| ipv4_cidr | IPv4 CIDR (e.g., 10.100.0.1/24) | - |
| nat_enabled | Enable NAT | true |
| ipv6_enabled | Enable IPv6 | false |
| dns_domain | DNS domain | "local" |

### Module Outputs

| Output | Description | 
|--------|-------------| 
| network_name | Network name |
| network_id | Network ID |
| ipv4_gateway | IPv4 gateway address |

## Deployment

### Network Configuration File

Location: `environments/legion-ubuntu/networking/terragrunt.hcl`

```hcl
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
```

### Deploy Network

```bash
cd environments/legion-ubuntu/networking
terragrunt init
terragrunt plan
terragrunt apply
```

**Note**: In practice, you don't need to manually deploy networking. It's automatically deployed when you create VMs due to dependency management.

## Verification

### Check Network in Incus

```bash
incus network list
```

Expected output:
```
+----------+----------+---------+----------------+--------+
|   NAME   |   TYPE   | MANAGED |      IPV4      | IPV6   |
+----------+----------+---------+----------------+--------+
| incusbr0 | bridge   | YES     | 10.100.0.1/24  |        |
+----------+----------+---------+----------------+--------+
```

### Show Network Details

```bash
incus network show incusbr0
```

Expected output:
```yaml
config:
  ipv4.address: 10.100.0.1/24
  ipv4.nat: "true"
  ipv6.address: none
  dns.domain: legion.local
description: ""
name: incusbr0
type: bridge
used_by:
- /1.0/instances/omv-vm
- /1.0/instances/arr-stack-vm
managed: true
status: Created
locations:
- none
```

### Check Bridge on Host

```bash
ip addr show incusbr0
```

Expected output:
```
... incusbr0: <BROADCAST,MULTICAST,UP,LOWER_UP> ...
    inet 10.100.0.1/24 brd 10.100.0.255 scope global incusbr0
```

### Test Network Connectivity

Launch a test container:

```bash
incus launch images:debian/12 test-network
```

Check IP assignment:

```bash
incus list test-network
```

Test internet access from container:

```bash
incus exec test-network -- ping -c 3 google.com
```

Clean up:

```bash
incus delete test-network --force
```

## Network Features

### 1. DHCP (Automatic IP Assignment)

Incus dnsmasq automatically assigns IPs to VMs from the configured range.

View DHCP leases:

```bash
incus network list-leases incusbr0
```

### 2. NAT (Network Address Translation)

NAT allows VMs to access the internet through the host's connection.

Check NAT rules:

```bash
sudo iptables -t nat -L -n -v | grep 10.100.0
```

### 3. DNS Resolution

Incus provides DNS for VMs:
- VMs can resolve each other by name
- Format: `<vm-name>.lxd`
- Example: `ping omv-vm.lxd` from another VM

### 4. Port Forwarding (Optional)

Forward external ports to VMs:

```bash
# Forward host port 8989 to arr-stack-vm:8989 (Sonarr)
incus config device add arr-stack-vm sonarr-port proxy \
  listen=tcp:0.0.0.0:8989 \
  connect=tcp:127.0.0.1:8989
```

## Advanced Configuration

### Static IP Assignment

Assign a static IP to a VM:

```bash
incus network set incusbr0 ipv4.dhcp.ranges=10.100.0.100-10.100.0.200

# Reserve IP for a specific VM (by MAC address)
incus config device set omv-vm eth0 ipv4.address=10.100.0.10
```

### Multiple Networks

Create additional networks for isolation:

```bash
# Create management network
incus network create mgmt-net \
  ipv4.address=10.101.0.1/24 \
  ipv4.nat=true \
  dns.domain=mgmt.local

# Attach VM to multiple networks
incus config device add omv-vm eth1 nic \
  network=mgmt-net \
  name=eth1
```

### IPv6 Configuration

Enable IPv6:

```bash
incus network set incusbr0 ipv6.address=fd00::1/64
incus network set incusbr0 ipv6.nat=true
```

Update Terragrunt config:

```hcl
inputs = {
  ipv6_enabled = true
  ipv6_cidr    = "fd00::1/64"
}
```

### Firewall Rules

Allow specific traffic:

```bash
# Allow HTTP/HTTPS to ARR VM
sudo iptables -I FORWARD -d 10.100.0.x -p tcp --dport 80 -j ACCEPT
sudo iptables -I FORWARD -d 10.100.0.x -p tcp --dport 443 -j ACCEPT
```

Make permanent:

```bash
sudo apt-get install iptables-persistent
sudo netfilter-persistent save
```

## Troubleshooting

### VMs Cannot Access Internet

Check NAT is enabled:

```bash
incus network show incusbr0 | grep ipv4.nat
```

Check iptables rules:

```bash
sudo iptables -t nat -L POSTROUTING -n -v
```

Enable IP forwarding on host:

```bash
echo 1 | sudo tee /proc/sys/net/ipv4/ip_forward
# Make permanent
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

### VMs Cannot Reach Each Other

Check bridge is up:

```bash
ip link show incusbr0
```

Check VMs are on same network:

```bash
incus network list-leases incusbr0
```

Test connectivity from VM:

```bash
incus exec arr-stack-vm -- ping 10.100.0.1  # Gateway
```

### DNS Not Resolving

Check dnsmasq is running:

```bash
sudo systemctl status dnsmasq@incusbr0
```

Verify VM DNS configuration:

```bash
incus exec arr-stack-vm -- cat /etc/resolv.conf
```

Should show:
```
nameserver 10.100.0.1
```

### Bridge Not Created

Manually create bridge:

```bash
incus network create incusbr0 \
  ipv4.address=10.100.0.1/24 \
  ipv4.nat=true \
  ipv6.address=none \
  dns.domain=legion.local
```

### Port Conflicts

If 10.100.0.0/24 conflicts with existing network, use different CIDR:

Edit `environments/legion-ubuntu/env.hcl`:

```hcl
locals {
  network_cidr = "10.200.0.1/24"  # Use different range
}
```

Recreate network:

```bash
incus network delete incusbr0
cd environments/legion-ubuntu/networking
terragrunt apply
```

## Network Performance

### Check Network Statistics

```bash
# Host bridge stats
ip -s link show incusbr0

# Per-VM stats
incus info arr-stack-vm | grep -A 10 Network
```

### Optimize Network Performance

For high-throughput scenarios:

```bash
# Increase MTU (if supported)
incus network set incusbr0 bridge.mtu=9000

# Disable TX offload if experiencing issues
incus config device set arr-stack-vm eth0 host_name=veth-arr
sudo ethtool -K veth-arr tx off
```

## Network Security

### Isolate VMs

Create separate networks for different purposes:

```bash
# Create isolated network for sensitive services
incus network create secure-net \
  ipv4.address=10.102.0.1/24 \
  ipv4.nat=false \
  ipv6.address=none
```

### Restrict Access

Use iptables to limit VM traffic:

```bash
# Block access from ARR VM to OMV management
sudo iptables -I FORWARD -s 10.100.0.x -d 10.100.0.y -p tcp --dport 80 -j DROP
```

## Next Steps

Now that networking is configured, proceed to:

- [OMV NAS VM Deployment](05-omv-nas-vm.md) - Deploy OpenMediaVault Storage Server

## Summary

Your Incus network provides:
- **Isolation**: VMs on private network
- **Internet Access**: NAT allows outbound connections
- **Inter-VM Communication**: VMs can talk to each other
- **DNS**: Automatic name resolution
- **DHCP**: Automatic IP assignment
- **Flexibility**: Easy to extend with additional networks

All managed through Infrastructure as Code!