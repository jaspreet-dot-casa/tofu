# Troubleshooting Guide

This guide covers common issues and their solutions.

## OpenTofu/Terragrunt Issues

### Error: Dependency cycle detected
Check your dependencies in `terragrunt.hcl`. Ensure `arr-stack-vm` depends on `networking`, but not vice-versa.

## NFS Mount Issues (Split VM Specific)

### ARR VM cannot mount /mnt/media

1.  **Check Connectivity**:
    ```bash
    incus exec arr-stack-vm -- ping 10.100.0.10
    ```
    If ping fails, check `ufw` on OMV VM.

2.  **Check Exports on OMV**:
    SSH into OMV VM:
    ```bash
    exportfs -v
    ```
    Ensure `/export/media` lists the correct subnet (`10.100.0.0/24`).

3.  **Check Permissions**:
    If you get "Permission Denied" when writing files:
    *   Ensure OMV export has `no_root_squash`.
    *   Check directory permissions on OMV: `chmod 777 /export/media` (for testing).

## VM Creation Issues

### Cloud-init errors
Check logs inside the VM:
```bash
cat /var/log/cloud-init-output.log
```
Look for `nfs-common` installation failures or mount errors.