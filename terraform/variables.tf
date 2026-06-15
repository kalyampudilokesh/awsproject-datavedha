variable "db_password" {
  description = "RDS database password"
  type        = string
  sensitive   = true
}
variable "ecommerce_secret_arn" {
  description = "Secrets Manager ARN for ecommerce database"
  type        = string
}