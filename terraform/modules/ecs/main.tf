resource "aws_ecs_cluster" "main" {

  name = "${var.project_name}-cluster"
}
resource "aws_ecs_task_definition" "products" {

  family = "products-service"

  network_mode = "awsvpc"

  requires_compatibilities = ["FARGATE"]

  cpu = "256"

  memory = "512"

  execution_role_arn = var.execution_role_arn

  task_role_arn = var.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "products"

      image = "nginx:latest"

      essential = true

      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
    }
  ])
}
resource "aws_ecs_task_definition" "orders" {

  family = "orders-service"

  network_mode = "awsvpc"

  requires_compatibilities = ["FARGATE"]

  cpu = "256"

  memory = "512"

  execution_role_arn = var.execution_role_arn

  task_role_arn = var.task_role_arn

  container_definitions = jsonencode([
    {
      name  = "orders"

      image = "nginx:latest"

      essential = true

      portMappings = [
        {
          containerPort = 8000
          hostPort      = 8000
        }
      ]
    }
  ])
}

resource "aws_ecs_service" "products" {

  name = "products-service"

  cluster = aws_ecs_cluster.main.id

  task_definition = aws_ecs_task_definition.products.arn

  desired_count = 1

  launch_type = "FARGATE"

  network_configuration {

    subnets = var.private_subnet_ids

    security_groups = [
      var.ecs_sg_id
    ]

    assign_public_ip = false
  }

  load_balancer {

    target_group_arn = var.products_target_group_arn

    container_name = "products"

    container_port = 3000
  }
}

resource "aws_ecs_service" "orders" {

  name = "orders-service"

  cluster = aws_ecs_cluster.main.id

  task_definition = aws_ecs_task_definition.orders.arn

  desired_count = 1

  launch_type = "FARGATE"

  network_configuration {

    subnets = var.private_subnet_ids

    security_groups = [
      var.ecs_sg_id
    ]

    assign_public_ip = false
  }

  load_balancer {

    target_group_arn = var.orders_target_group_arn

    container_name = "orders"

    container_port = 8000
  }
}