output "instance_name" {
  description = "VM instance name"
  value       = incus_instance.vm.name
}

output "ipv4_address" {
  description = "VM IPv4 address"
  value       = incus_instance.vm.ipv4_address
}

output "ipv6_address" {
  description = "VM IPv6 address"
  value       = incus_instance.vm.ipv6_address
}

output "status" {
  description = "VM status"
  value       = incus_instance.vm.status
}
