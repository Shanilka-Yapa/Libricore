output "ec2_public_ip" {
  value = aws_instance.web_server.public_ip
}

output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
}