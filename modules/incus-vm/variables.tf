variable "name" {
  description = "VM instance name"
  type        = string
}

variable "image" {
  description = "Incus image (e.g., images:debian/12/cloud)"
  type        = string
  default     = "images:debian/12/cloud"
}

variable "cpu_count" {
  description = "Number of CPU cores"
  type        = number
  default     = 2
}

variable "memory_mb" {
  description = "Memory in MB"
  type        = number
  default     = 2048
}

variable "disk_size_gb" {
  description = "Root disk size in GB"
  type        = number
  default     = 20
}

variable "storage_pool" {
  description = "Incus storage pool"
  type        = string
  default     = "default"
}

variable "network_name" {
  description = "Incus network name"
  type        = string
}

variable "cloud_init_user_data" {
  description = "Cloud-init user-data (YAML)"
  type        = string
  default     = ""
}

variable "cloud_init_vendor_data" {
  description = "Cloud-init vendor-data (YAML)"
  type        = string
  default     = ""
}

variable "profiles" {
  description = "List of Incus profiles"
  type        = list(string)
  default     = ["default"]
}

variable "additional_devices" {
  description = "Additional devices to attach"
  type = map(object({
    type       = string
    properties = map(string)
  }))
  default = {}
}
