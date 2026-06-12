variable "project_name" {}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_sg_id" {}

variable "execution_role_arn" {}

variable "task_role_arn" {}

variable "orders_target_group_arn" {}

variable "products_blue_target_group_arn" {
  type = string
}

variable "db_endpoint" {}

variable "db_host" {}

variable "db_username" {}

variable "db_password" {
  sensitive = true
}

variable "products_service_url" {
  default = "http://localhost:3000"
}

variable "allowed_origins" {
  default = "http://localhost:5173"
}