# Part 1: OMV NAS VM Deployment

This guide covers deploying the **Storage Layer** of your homelab: a dedicated OpenMediaVault (OMV) VM.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              OMV NAS VM (omv-vm)                        │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   OpenMediaVault 7                               │  │
│  │   Web UI: http://10.100.0.x                      │  │
│  │   - Storage Management (LVM/Ext4)                │  │
│  │   - NFS Server (Exports /export/media)           │  │
│  │   - SMB Server (Optional for Windows access)     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Storage Devices                                │  │
│  │   - Root Disk (50GB)                             │  │
│  │   - Data Disk (500GB) -> /srv/dev-disk...        │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Completed [Networking Setup](04-networking.md)
- Sufficient disk space in your Incus storage pool (default LVM pool)

## Step 1: Configuration

Navigate to the OMV VM directory:
```bash
cd environments/legion-ubuntu/omv-vm
```

Review `terragrunt.hcl`. It should look similar to this:

```hcl
include "root" {
  path = find_in_parent_folders()
}

include "env" {
  path = find_in_parent_folders("terragrunt.hcl")
}

dependency "network" {
  config_path = "../networking"
  mock_outputs = { network_name = "incusbr0" }
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
  memory_mb    = 4096  # 4GB RAM is sufficient for OMV
  disk_size_gb = 50    # Root disk
  storage_pool = local.env_vars.locals.storage_pool

  network_name = dependency.network.outputs.network_name

  cloud_init_vendor_data = file("${get_terragrunt_dir()}/cloud-init-vendor.yaml")
  cloud_init_user_data   = file("${get_terragrunt_dir()}/cloud-init-user.yaml")

  # Additional 500GB disk for NAS storage
  additional_devices = {
    nas_data = {
      type = "disk"
      properties = {
        path = "/srv/dev-disk-by-uuid-nas" # Incus requires a path, but OMV will manage mounting
        pool = local.env_vars.locals.storage_pool
        size = "500GiB"
      }
    }
  }

  profiles = [local.env_vars.locals.default_profile]
}
```

**Key Configuration:**
- **Memory**: 4GB is plenty for a pure storage node.
- **Additional Devices**: We attach a 500GB virtual disk from the storage pool.

## Step 2: Deploy OMV VM

Initialize and apply the configuration:

```bash
terragrunt init
terragrunt plan
terragrunt apply
```

**What happens:**
1. Incus creates the VM `omv-vm`.
2. Incus attaches the 500GB disk.
3. Cloud-init runs the Ansible playbook defined in `cloud-init-user.yaml`.
4. Ansible installs OMV 7 and initializes the database.

**Wait time**: This process can take 10-15 minutes as it downloads and installs OMV packages.

## Step 3: Configure OMV Web UI

### 1. Access the UI
Find the IP address:
```bash
incus list omv-vm
```
Open `http://<OMV_IP>` in your browser.

**Default Credentials:**
- Username: `admin`
- Password: `openmediavault`

**Security Tip**: Change the password immediately under **System > Workbench > Password**.

### 2. Configure Storage
1.  **Mount the Data Disk**:
    *   Go to **Storage > File Systems**.
    *   You should see the 500GB disk. If not, check **Storage > Disks**.
    *   Select the disk, click **Create** (Format as EXT4 or XFS).
    *   After formatting, click **Mount**.
    *   Apply changes (Top bar yellow banner).

2.  **Create Shared Folders**:
    *   Go to **Storage > Shared Folders**.
    *   Create a folder named `media`.
    *   Select the file system you just mounted.
    *   Path: `media/` (or `/media`).
    *   Permissions: Read/Write for Everyone (or restrict as needed, but for internal homelab, open permissions simplifies the NFS mount).

### 3. Configure NFS (Network File System)
To allow the ARR stack to access this storage, we will share it via NFS.

1.  **Enable NFS Service**:
    *   Go to **Services > NFS > Settings**.
    *   Check **Enable**.
    *   Click **Save**.

2.  **Create Export**:
    *   Go to **Services > NFS > Shares**.
    *   Click **Create**.
    *   **Shared Folder**: Select `media`.
    *   **Client**: `10.100.0.0/24` (Allow access from local Incus network).
    *   **Options**: `rw,subtree_check,insecure,no_root_squash`
        *   `rw`: Read/Write access.
        *   `no_root_squash`: Important for Docker containers running as root or specific UIDs to write files.
    *   Click **Save**.

3.  **Apply Changes**: Click the checkmark in the yellow banner to apply configuration.

### 4. Set Static IP (Recommended)
For the ARR stack to reliably mount the NFS share, OMV needs a static IP.

1.  Go to **Network > Interfaces**.
2.  Edit the primary interface (usually `eth0`).
3.  IPv4: **Static**.
4.  Address: `10.100.0.10` (Example).
5.  Netmask: `255.255.255.0`.
6.  Gateway: `10.100.0.1`.
7.  DNS: `10.100.0.1` (or `8.8.8.8`).
8.  Save and Apply.
    *   *Warning*: You will lose connection and need to access the UI at the new IP.

**Alternatively**, use Incus to set a static lease:
```bash
incus config device set omv-vm eth0 ipv4.address=10.100.0.10
incus restart omv-vm
```

## Step 4: Verification
From your host machine, check if the NFS share is visible (requires `nfs-common` on host, or just skip to next step):

```bash
showmount -e 10.100.0.10
```
Expected output:
```
Export list for 10.100.0.10:
/export/media 10.100.0.0/24
```

## Next Steps

Your storage server is ready! Now deploy the media application stack in the next tutorial.

[Part 2: Media Stack (ARR) VM](06-arr-stack-vm.md)