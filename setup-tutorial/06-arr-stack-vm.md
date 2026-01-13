# Part 2: Media Stack (ARR) VM Deployment

This guide covers deploying the **Compute Layer**: a dedicated VM running the ARR stack (Sonarr, Radarr, etc.) which mounts storage from your OMV VM.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              ARR Stack VM (arr-stack-vm)                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Docker Containers                              │  │
│  │   [Sonarr] [Radarr] [Prowlarr] [qBittorrent]     │  │
│  └───────────────────────┬──────────────────────────┘  │
│                          │ Writes via NFS               │
│                          ▼                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │   Mount Point: /mnt/media                        │  │
│  │   (Maps to OMV: /export/media)                   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
            │
            ▼ Network (Incus Bridge)
┌─────────────────────────────────────────────────────────┐
│              OMV NAS VM (omv-vm)                        │
└─────────────────────────────────────────────────────────┘
```

## Prerequisites

- Completed [Part 1: OMV NAS VM](05-omv-nas-vm.md)
- OMV VM must be running and have NFS configured
- OMV VM should have a known IP (e.g., `10.100.0.10`)

## Step 1: Configuration

Navigate to the ARR stack directory:
```bash
cd environments/legion-ubuntu/arr-stack-vm
```

Review `terragrunt.hcl`. It defines the VM resources:

```hcl
inputs = {
  name         = "arr-stack-vm"
  cpu_count    = 4     # Media processing needs CPU
  memory_mb    = 4096  # 4GB RAM
  disk_size_gb = 100   # 100GB Root disk (for Docker images/logs)
  # ...
}
```

## Step 2: Configure NFS Mount

To mount the OMV storage automatically, we update the `cloud-init-user.yaml` file.

**Action**: Edit `cloud-init-user.yaml` in the `arr-stack-vm` directory.

Add the `mounts` module and `nfs-common` package.

```yaml
#cloud-config

packages:
  - nfs-common  # <--- REQUIRED for NFS

mounts:
  - [ "10.100.0.10:/export/media", "/mnt/media", "nfs", "defaults,timeo=14,intr", "0", "0" ]

write_files:
  # ... existing files ...
```

**Note**: Replace `10.100.0.10` with your actual OMV VM IP address.

## Step 3: Deploy ARR VM

Initialize and apply:

```bash
terragrunt init
terragrunt plan
terragrunt apply
```

**What happens:**
1. Incus creates `arr-stack-vm`.
2. Cloud-init installs `nfs-common`.
3. Cloud-init mounts `10.100.0.10:/export/media` to `/mnt/media`.
4. Cloud-init installs Docker and starts the containers defined in the user data.

## Step 4: Verify Mounts

SSH into the ARR VM to verify connectivity:

```bash
incus exec arr-stack-vm -- bash
```

Check the mount:
```bash
df -h /mnt/media
```
You should see the size of your OMV disk (approx 500GB).

Try writing a file:
```bash
touch /mnt/media/test-file.txt
ls -l /mnt/media/test-file.txt
```
If this succeeds, your compute VM is successfully writing to your storage VM!

## Step 5: Configure Docker Compose

The `cloud-init-user.yaml` already sets up a default `docker-compose.yml` at `/home/debian/docker-compose.yml`.

Ensure the volume mappings match your mount point:

```yaml
services:
  sonarr:
    volumes:
      - /mnt/media/tv:/tv
      - /mnt/media/downloads:/downloads
  radarr:
    volumes:
      - /mnt/media/movies:/movies
      - /mnt/media/downloads:/downloads
  qbittorrent:
    volumes:
      - /mnt/media/downloads:/downloads
```

## Step 6: Access Services

Open your browser to access the services:
*   **Sonarr**: `http://<ARR_VM_IP>:8989`
*   **Radarr**: `http://<ARR_VM_IP>:7878`
*   **qBittorrent**: `http://<ARR_VM_IP>:8080`

## Next Steps

- [Monitoring Setup](06a-monitoring-setup.md): Add Prometheus/Grafana to watch your stack.
- [Advanced Topics](07-advanced-topics.md): Learn about backup and maintenance.
