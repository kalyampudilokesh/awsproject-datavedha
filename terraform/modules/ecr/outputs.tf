output "products_repository_url" {
  value = aws_ecr_repository.products.repository_url
}

output "orders_repository_url" {
  value = aws_ecr_repository.orders.repository_url
}

output "products_repository_name" {
  value = aws_ecr_repository.products.name
}

output "orders_repository_name" {
  value = aws_ecr_repository.orders.name
}