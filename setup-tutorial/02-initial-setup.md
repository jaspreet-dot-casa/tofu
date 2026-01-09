# Initial Setup

This guide walks you through installing OpenTofu, Terragrunt, and Incus on your Ubuntu system.

## 1. Install OpenTofu

OpenTofu is an open-source Infrastructure as Code tool, compatible with Terraform.

### Installation via Official Script

```bash
# Download and install OpenTofu using the official script
curl --proto '=https' --tlsv1.2 -fsSL https://get.opentofu.org/install-opentofu.sh | sh

# Verify installation
tofu version
```

Expected output:
```
OpenTofu v1.11.0
on linux_amd64
```

**New in OpenTofu 1.11+:**
- Ephemeral resources for handling confidential data and temporary credentials
- Enhanced testing capabilities
- Performance improvements

### Alternative: Manual Installation

If you prefer manual installation:

```bash
# Download OpenTofu binary
TOFU_VERSION="1.11.0"
wget "https://github.com/opentofu/opentofu/releases/download/v${TOFU_VERSION}/tofu_${TOFU_VERSION}_linux_amd64.zip"

# Extract and install
unzip "tofu_${TOFU_VERSION}_linux_amd64.zip"
sudo mv tofu /usr/local/bin/
sudo chmod +x /usr/local/bin/tofu

# Verify
tofu version

# Cleanup
rm "tofu_${TOFU_VERSION}_linux_amd64.zip"
```

## 2. Install Terragrunt

Terragrunt is a thin wrapper for Terraform/OpenTofu that provides extra tools for working with multiple modules.

### Installation

```bash
# Set Terragrunt version
TERRAGRUNT_VERSION="v0.97.0"

# Download Terragrunt binary
wget "https://github.com/gruntwork-io/terragrunt/releases/download/${TERRAGRUNT_VERSION}/terragrunt_linux_amd64"

# Install to /usr/local/bin
sudo mv terragrunt_linux_amd64 /usr/local/bin/terragrunt
sudo chmod +x /usr/local/bin/terragrunt

# Verify installation
terragrunt --version
```

Expected output:
```
terragrunt version v0.97.0
```

**Note**: Terragrunt 1.0 is expected to be released in Q1 2026. Version 0.97.0 is fully compatible and will have a smooth upgrade path to 1.0.

## 3. Install Incus

Incus is a modern system container and virtual machine manager, forked from LXD.

### Installation via Official Repository

```bash
# Install Incus from the official Zabbly repository
curl -fsSL https://pkgs.zabbly.com/get/incus-stable | sudo sh

# Verify installation
incus version
```

Expected output:
```
Client version: 6.19 (or 6.0 LTS)
Server version: 6.19 (or 6.0 LTS)
```

**Major Update**: Incus has reached v6.x with significant improvements:
- **Incus 6.0 LTS**: Long-term support release (supported until June 2029)
- **New features**: SELinux support, TrueNAS storage driver, OVN networking enhancements
- **Stability**: Major improvements in performance and reliability
- **IncusOS CLI**: New administration tools for IncusOS systems

### Alternative: Install from Ubuntu Repositories (if available)

```bash
# Update package list
sudo apt update

# Install Incus
sudo apt install -y incus

# Verify
incus version
```

## 4. Configure Incus

After installation, initialize Incus with the following steps:

### Run Incus Initialization

```bash
sudo incus admin init
```

You'll be prompted with several questions. Here are the recommended answers for this tutorial:

```
Would you like to use LXD clustering? (yes/no) [default=no]: no

Do you want to configure a new storage pool? (yes/no) [default=yes]: yes
Name of the new storage pool [default=default]: default
Name of the storage backend to use (lvm, btrfs, dir, zfs) [default=zfs]: lvm

Create a new LVM volume group? (yes/no) [default=yes]: yes
Would you like to use an existing empty block device? (yes/no) [default=no]: no
Size in GiB of the new loop device (1GiB minimum) [default=30GiB]: 700GiB

Would you like to connect to a MAAS server? (yes/no) [default=no]: no

Would you like to create a new local network bridge? (yes/no) [default=yes]: yes
What should the new bridge be called? [default=incusbr0]: incusbr0
What IPv4 address should be used? (CIDR subnet notation, "auto" or "none") [default=auto]: 10.100.0.1/24
What IPv6 address should be used? (CIDR subnet notation, "auto" or "none") [default=auto]: none

Would you like the server to be available over the network? (yes/no) [default=no]: no

Would you like stale cached images to be updated automatically? (yes/no) [default=yes]: yes

Would you like a YAML "incus admin init" preseed to be printed? (yes/no) [default=no]: no
```

### Key Configuration Choices Explained

- **Storage backend: LVM** - Flexible, good performance, snapshot support
- **Loop device size: 700GiB** - Enough for both VMs (50GB OMV + 100GB ARR + 500GB Media + overhead)
- **Network bridge: incusbr0** - Standard bridge name

### Add User to Incus Group

```bash
# Add your user to the incus group
sudo usermod -aG incus $USER

# Apply the group change (option 1: log out and back in, or option 2: use newgrp)
newgrp incus

# Verify you can run incus commands without sudo
incus list
```

Expected output:
```
+------+-------+------+------+------+-----------+
| NAME | STATE | IPV4 | IPV6 | TYPE | SNAPSHOTS |
+------+-------+------+------+------+-----------+
```

(Empty list is expected at this point)

## 5. Verify Installation

Run the validation script to ensure everything is properly installed:

```bash
# Navigate to your project directory
cd ~/tofu  # or wherever you cloned the repository

# Make the validation script executable
chmod +x scripts/validate-prereqs.sh

# Run validation
./scripts/validate-prereqs.sh
```

Expected output:
```
Validating prerequisites...
✓ OpenTofu: OpenTofu v1.11.0
✓ Terragrunt: terragrunt version v0.97.0
✓ Incus: Client version: 6.x
✓ Incus daemon running
✓ Incus storage configured
✓ Incus network configured

All prerequisites validated! Ready to proceed.
```

## 6. Verify Incus Configuration

### Check Storage Pools

```bash
incus storage list
```

Expected output:
```
+----------+--------+--------+------------------------------------+---------+
|   NAME   | DRIVER | SOURCE |            DESCRIPTION             | USED BY |
+----------+--------+--------+------------------------------------+---------+
| default  | lvm    |        | LVM storage pool                   | 0       |
+----------+--------+--------+------------------------------------+---------+
```

### Check Networks

```bash
incus network list
```

Expected output:
```
+----------+----------+---------+----------------+--------+-------------+
|   NAME   |   TYPE   | MANAGED |      IPV4      | IPV6   | DESCRIPTION |
+----------+----------+---------+----------------+--------+-------------+
| incusbr0 | bridge   | YES     | 10.100.0.1/24  |        |             |
+----------+----------+---------+----------------+--------+-------------+
```

### Check Incus Profiles

```bash
incus profile show default
```

Expected output should include network and storage configuration:
```yaml
config: {}
description: Default Incus profile
devices:
  eth0:
    name: eth0
    network: incusbr0
    type: nic
  root:
    path: /
    pool: default
    type: disk
name: default
used_by: []
```

## 7. Test VM Creation (Optional)

Test that Incus can create a VM:

```bash
# Launch a test VM
incus launch images:debian/12 test-vm

# Wait a few seconds, then check status
incus list
```

Expected output:
```
+----------+---------+-----------------------+------+-----------------+-----------+
|   NAME   |  STATE  |         IPV4          | IPV6 |      TYPE       | SNAPSHOTS |
+----------+---------+-----------------------+------+-----------------+-----------+
| test-vm  | RUNNING | 10.100.0.x (eth0)     |      | CONTAINER       | 0         |
+----------+---------+-----------------------+------+-----------------+-----------+
```

Clean up the test VM:

```bash
incus delete test-vm --force
```

## Troubleshooting

### Incus Permission Denied

If you get permission errors when running `incus` commands:

```bash
# Verify you're in the incus group
groups | grep incus

# If not, add yourself again
sudo usermod -aG incus $USER

# Log out and back in, or run
newgrp incus
```

### LVM Volume Group Creation Failed

If LVM initialization fails:

```bash
# Check available disk space
df -h

# You may need to use a dedicated partition or disk
# See Incus documentation for manual LVM setup
```

### Network Bridge Not Created

If the network bridge wasn't created:

```bash
# Create manually
incus network create incusbr0 \
  ipv4.address=10.100.0.1/24 \
  ipv4.nat=true

# Verify
incus network list
```

## Next Steps

Now that your environment is set up, proceed to [Project Structure](03-project-structure.md) to organize your Infrastructure as Code project.
