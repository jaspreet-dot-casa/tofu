variable "network_name" {
  description = "Network name"
  type        = string
}

variable "ipv4_cidr" {
  description = "IPv4 CIDR (e.g., 10.100.0.1/24)"
  type        = string
}

variable "ipv6_enabled" {
  description = "Enable IPv6"
  type        = bool
  default     = false
}

variable "ipv6_cidr" {
  description = "IPv6 CIDR"
  type        = string
  default     = ""
}

variable "nat_enabled" {
  description = "Enable NAT"
  type        = bool
  default     = true
}

variable "dns_domain" {
  description = "DNS domain"
  type        = string
  default     = "local"
}
