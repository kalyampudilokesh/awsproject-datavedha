variable "project_name" {}

variable "private_subnet_ids" {
  type = list(string)
}

variable "ecs_sg_id" {}

variable "execution_role_arn" {}

variable "task_role_arn" {}

variable "products_target_group_arn" {}

variable "orders_target_group_arn" {}

variable "db_endpoint" {}