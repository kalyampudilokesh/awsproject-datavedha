output "alb_dns_name" {

  value = aws_lb.main.dns_name
}

output "orders_target_group_arn" {

  value = aws_lb_target_group.orders.arn
}

output "alb_listener_arn" {

  value = aws_lb_listener.http.arn
}

output "products_blue_target_group_arn" {
  value = aws_lb_target_group.products_blue.arn
}

output "products_green_target_group_arn" {
  value = aws_lb_target_group.products_green.arn
}