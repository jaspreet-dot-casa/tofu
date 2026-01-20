output "pool_name" {
  description = "Storage pool name"
  value       = incus_storage_pool.pool.name
}

output "pool_id" {
  description = "Storage pool ID"
  value       = incus_storage_pool.pool.id
}

output "pool_driver" {
  description = "Storage pool driver"
  value       = incus_storage_pool.pool.driver
}
