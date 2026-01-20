# Prerequisites

Before beginning this tutorial, ensure your system meets the following requirements.

## Hardware Requirements

### Minimum Specifications
- **CPU**: 6 cores with virtualization support (Intel VT-x or AMD-V)
- **RAM**: 12GB minimum (4GB for OMV VM + 4GB for ARR VM + 4GB for host)
- **Disk Space**: 650GB+ available storage (50GB OMV root + 100GB ARR root + 500GB media storage)
- **Network**: Stable internet connection for package downloads

### Recommended Specifications
- **CPU**: 8+ cores with virtualization support (2 for OMV + 4 for ARR + 2 for host)
- **RAM**: 16GB or more (4GB for OMV + 8GB for ARR + 4GB for host)
- **Disk Space**: 1TB+ SSD for best performance
- **Network**: Gigabit Ethernet

**Note**: This tutorial builds a **Split VM Architecture** for maximum reliability and isolation:
1. **OMV NAS VM**: Dedicated to storage management and NFS sharing.
2. **ARR Stack VM**: Dedicated to media automation and Docker containers.

### Storage Considerations

For LVM storage backend (recommended in this tutorial):
- Dedicated disk or partition for LVM volume group.
- At least 650GB total for the setup:
  - 50GB for OMV root disk.
  - 100GB for ARR stack root disk.
  - 500GB for media storage (managed by OMV and shared via NFS).
- SSD recommended for better I/O performance, especially for media libraries and Docker databases.

## Software Requirements

### Operating System
- **Ubuntu 24.04 LTS** (Recommended - supported until 2029)
- **Ubuntu 22.04 LTS** (Also supported)
- **Other Debian-based distributions** (May work with minor adjustments)

**Note on Debian 12 (Bookworm):**
- Full support ends June 10, 2026
- LTS (Long Term Support) extends until June 30, 2028
- Tutorial uses Debian 12 for VM cloud images (stable and well-supported)

### Required Tools (to be installed)
- **OpenTofu** (v1.11+) - Open-source Terraform alternative
- **Terragrunt** (v0.96+) - Terraform/OpenTofu wrapper
- **Incus** (v6.0+ LTS) - LXC/VM manager
- **Cloud-init** (v25.3+) - VM initialization and configuration

### User Permissions
- Sudo access for installing packages
- User must be added to `incus` group (done during setup)

## Knowledge Prerequisites

### Required Knowledge
- Basic Linux command-line usage
- Understanding of SSH and networking concepts (specifically NFS)
- Familiarity with YAML configuration files
- Basic understanding of virtualization

### Helpful but Not Required
- Previous experience with Terraform/Infrastructure as Code
- Docker and container concepts
- Ansible basics
- Understanding of ARR stack applications

## Verification Checklist

Before proceeding to installation, verify:

- [ ] CPU virtualization is enabled in BIOS/UEFI
- [ ] Ubuntu 24.04 LTS (or compatible) is installed
- [ ] You have sudo access
- [ ] At least 650GB disk space is available
- [ ] System has 16GB+ RAM
- [ ] Internet connection is active

### Check CPU Virtualization

Run this command to verify virtualization support:

```bash
# Check for Intel VT-x or AMD-V
egrep -c '(vmx|svm)' /proc/cpuinfo
```

Expected output: A number greater than 0 (indicates number of cores with virtualization)

If output is 0, enable virtualization in your BIOS/UEFI settings.

### Check Available Disk Space

```bash
df -h /
```

Ensure you have sufficient free space on the root partition or the partition where you'll store VMs.

### Check Memory

```bash
free -h
```

Verify total available RAM meets the minimum requirements.

## Network Configuration

### Firewall Considerations
- If running a firewall, ensure it allows:
  - Outbound HTTPS (443) for package downloads
  - SSH (22) if managing remotely
  - VM network traffic (will be configured by Incus)

### DNS Configuration
- Ensure your system can resolve DNS queries
- Test with: `nslookup google.com`

## Next Steps

Once your system meets all prerequisites, proceed to [Initial Setup](02-initial-setup.md) to install the required tools.