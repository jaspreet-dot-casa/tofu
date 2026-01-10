resource "incus_storage_pool" "pool" {
  name   = var.pool_name
  driver = var.pool_driver

  config = var.pool_config

  lifecycle {
    prevent_destroy = var.prevent_destroy
  }
}
