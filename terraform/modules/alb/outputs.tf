output "alb_dns_name" {

  value = aws_lb.main.dns_name
}

output "products_target_group_arn" {

  value = aws_lb_target_group.products.arn
}

output "orders_target_group_arn" {

  value = aws_lb_target_group.orders.arn
}

output "alb_listener_arn" {

  value = aws_lb_listener.http.arn
}