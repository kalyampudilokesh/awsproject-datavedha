resource "aws_lb" "main" {

  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"

  security_groups = [
    var.alb_sg_id
  ]

  subnets = var.public_subnet_ids

  tags = {
    Name = "${var.project_name}-alb"
  }
}

resource "aws_lb_target_group" "products_blue" {

  name        = "${var.project_name}-products-blue"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "products_green" {

  name        = "${var.project_name}-products-green"
  port        = 3000
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }
}
resource "aws_lb_target_group" "orders" {

  name        = "${var.project_name}-orders"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "orders_blue" {

  name        = "${var.project_name}-orders-blue"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }
}

resource "aws_lb_target_group" "orders_green" {

  name        = "${var.project_name}-orders-green"
  port        = 8000
  protocol    = "HTTP"
  target_type = "ip"

  vpc_id = var.vpc_id

  health_check {
    path = "/health"
  }
}
resource "aws_lb_listener" "http" {

  load_balancer_arn = aws_lb.main.arn

  port     = 80
  protocol = "HTTP"

  default_action {

    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }
}
resource "aws_lb_listener_rule" "products" {

  listener_arn = aws_lb_listener.http.arn

  priority = 100

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.products_blue.arn
  }

  condition {
    path_pattern {
      values = [
        "/api/products*"
      ]
    }
  }
  lifecycle {
    ignore_changes = [
      action
    ]
  }
}

resource "aws_lb_listener_rule" "orders" {

  listener_arn = aws_lb_listener.http.arn

  priority = 200

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.orders.arn
  }

  condition {
    path_pattern {
      values = [
        "/api/orders*"
      ]
    }
  }
}
resource "aws_lb_listener" "test" {

  load_balancer_arn = aws_lb.main.arn

  port     = 8080
  protocol = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.products_green.arn
  }
}
resource "aws_lb_listener" "orders_test" {

  load_balancer_arn = aws_lb.main.arn

  port     = 8081
  protocol = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.orders_green.arn
  }
}