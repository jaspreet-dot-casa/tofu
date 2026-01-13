output "network_name" {
  description = "Network name"
  value       = incus_network.network.name
}

output "network_id" {
  description = "Network ID"
  value       = incus_network.network.id
}

output "ipv4_gateway" {
  description = "IPv4 gateway address"
  value       = split("/", var.ipv4_cidr)[0]
}
