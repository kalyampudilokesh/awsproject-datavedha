resource "aws_ecr_repository" "products" {

  name = "${var.project_name}-products-service"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "${var.project_name}-products-service"
  }
}
resource "aws_ecr_repository" "orders" {

  name = "${var.project_name}-orders-service"

  image_scanning_configuration {
    scan_on_push = true
  }

  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "${var.project_name}-orders-service"
  }
}