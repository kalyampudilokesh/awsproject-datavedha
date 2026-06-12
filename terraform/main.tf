module "vpc" {
  source = "./modules/vpc"

  project_name = "ecomm"

  vpc_cidr = "10.0.0.0/16"

  public_subnet_1_cidr = "10.0.1.0/24"
  public_subnet_2_cidr = "10.0.2.0/24"

  private_subnet_1_cidr = "10.0.11.0/24"
  private_subnet_2_cidr = "10.0.12.0/24"
}
module "security_groups" {
  source = "./modules/security-groups"

  project_name = "ecomm"
  vpc_id       = module.vpc.vpc_id
}
module "rds" {
  source = "./modules/rds"

  project_name = "ecomm"

  private_subnet_ids = module.vpc.private_subnet_ids

  rds_sg_id = module.security_groups.rds_sg_id

  db_name     = "ecommerce"
  db_username = "postgres"
  db_password = var.db_password
}
module "iam" {

  source = "./modules/iam"

  project_name = "ecomm"
}
module "ecr" {

  source = "./modules/ecr"

  project_name = "ecomm"
}
module "alb" {

  source = "./modules/alb"

  project_name = "ecomm"

  vpc_id = module.vpc.vpc_id

  public_subnet_ids = module.vpc.public_subnet_ids

  alb_sg_id = module.security_groups.alb_sg_id
}
module "ecs" {

  source = "./modules/ecs"

  project_name = "ecomm"

  private_subnet_ids = module.vpc.private_subnet_ids

  ecs_sg_id = module.security_groups.ecs_sg_id

  execution_role_arn = module.iam.execution_role_arn

  task_role_arn = module.iam.task_role_arn

  products_target_group_arn = module.alb.products_target_group_arn

  orders_target_group_arn = module.alb.orders_target_group_arn

  db_endpoint = module.rds.db_endpoint

  db_host = module.rds.db_endpoint

  db_username = "postgres"

  db_password = var.db_password

  products_service_url = "http://localhost:3000"

  allowed_origins = "http://localhost:5173"
}

module "s3_frontend" {

  source = "./modules/s3"

  project_name = "ecomm"
}