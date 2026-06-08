resource "aws_db_subnet_group" "main" {
  name = "${var.project_name}-db-subnet-group"

  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project_name}-db-subnet-group"
  }
}
resource "aws_db_instance" "postgres" {

  identifier = "${var.project_name}-postgres-db"

  engine         = "postgres"
  engine_version = "17"

  instance_class = "db.t3.micro"

  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  publicly_accessible = false

  vpc_security_group_ids = [
    var.rds_sg_id
  ]

  db_subnet_group_name = aws_db_subnet_group.main.name

  skip_final_snapshot = true

  deletion_protection = false

  tags = {
    Name = "${var.project_name}-postgres-db"
  }
}