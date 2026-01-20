# Advanced Topics

This guide covers advanced features and workflows for managing your infrastructure.

## Table of Contents

1. [Remote State Management](#remote-state-management)
2. [Secrets Management](#secrets-management)
3. [Backup and Disaster Recovery](#backup-and-disaster-recovery)
4. [Scaling](#scaling)

## Backup and Disaster Recovery

### Strategy for Split Architecture

With separate Compute and Storage, your backup strategy becomes simpler:

1.  **Storage (OMV VM)**:
    *   This is where your **Data** lives (Movies, TV).
    *   Use OMV's built-in backup tools or `rsync` to back up `/export/media` to an external drive or cloud.
    *   Since the OS is separate from Data, you can blow away the OMV OS and reinstall it without losing data (as long as the data disk is safe).

2.  **Compute (ARR VM)**:
    *   This is where your **Configuration** lives (Sonarr DB, Radarr DB).
    *   Back up the `/home/debian/arr-config` directory.
    *   Use the built-in backup features in Sonarr/Radarr (System > Backup).

### Snapshots

Incus makes snapshots easy:

```bash
# Snapshot the storage VM (OS only, usually)
incus snapshot create omv-vm pre-upgrade

# Snapshot the compute VM
incus snapshot create arr-stack-vm pre-upgrade
```

## Scaling

### Adding More Compute

If `arr-stack-vm` gets overloaded (e.g., transcoding Plex/Jellyfin), you can:
1.  Increase CPU/RAM in `arr-stack-vm/terragrunt.hcl`.
2.  Deploy a separate `plex-vm` that mounts the same NFS share from `omv-vm`. This is the power of the Split Architecture!

```hcl
# New VM: plex-vm
dependency "omv" { ... }
mounts = ["10.100.0.10:/export/media", "/mnt/media"]
```