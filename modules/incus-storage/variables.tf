variable "pool_name" {
  description = "Storage pool name"
  type        = string
}

variable "pool_driver" {
  description = "Storage driver (lvm, btrfs, dir, zfs)"
  type        = string
  default     = "lvm"
}

variable "pool_config" {
  description = "Storage pool configuration"
  type        = map(string)
  default     = {}
}

variable "prevent_destroy" {
  description = "Prevent accidental destruction of the storage pool (recommended for production)"
  type        = bool
  default     = true
}
