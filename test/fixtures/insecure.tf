provider "aws" {
  region = "us-east-1"
}

# Insecure S3 bucket - no encryption, no versioning, no logging
resource "aws_s3_bucket" "insecure" {
  bucket = "my-insecure-bucket"
  acl    = "public-read"
}

# Security group with overly permissive ingress
resource "aws_security_group" "insecure" {
  name        = "insecure-sg"
  description = "Insecure security group"

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
