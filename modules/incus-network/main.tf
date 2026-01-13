resource "incus_network" "network" {
  name = var.network_name

  config = {
    "ipv4.address" = var.ipv4_cidr
    "ipv4.nat"     = var.nat_enabled ? "true" : "false"
    "ipv6.address" = var.ipv6_enabled ? var.ipv6_cidr : "none"
    "dns.domain"   = var.dns_domain
  }
}
