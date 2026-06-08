terraform {
  backend "s3" {
    bucket         = "ecomm-tfstate"
    key            = "prod/terraform.tfstate"
    region         = "ap-southeast-2"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}