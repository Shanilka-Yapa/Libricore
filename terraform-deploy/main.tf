# 1. Create ECR Repositories
resource "aws_ecr_repository" "frontend" {
  name = "my-frontend"
}

resource "aws_ecr_repository" "backend" {
  name = "my-backend"
}

# 2. Security Group for Web and SSH
resource "aws_security_group" "app_sg" {
  name        = "web-app-sg"
  description = "Allow SSH and Web traffic"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # Change to your IP for better security
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. EC2 Instance
resource "aws_instance" "web_server" {
  ami           = "ami-0ff5003538b60d5ec" # Ubuntu 24.04 LTS (Verify for your region)
  instance_type = var.instance_type
  key_name      = var.key_name
  iam_instance_profile = aws_iam_instance_profile.ec2_profile.name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  # Install Docker and Docker Compose on startup
  user_data = <<-EOF
              #!/bin/bash
              sudo apt update -y
              sudo apt install -y docker.io
              sudo systemctl start docker
              sudo systemctl enable docker
              sudo usermod -aG docker ubuntu
              sudo apt install -y docker-compose-plugin
              EOF

  tags = {
    Name = "DevOps-Server"
  }
}

# 1. The "Role" (The identity itself)
resource "aws_iam_role" "ec2_ecr_role" {
  name = "libricore-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      },
    ]
  })
}

# 2. The "Policy" (Giving the role permission to Read ECR)
resource "aws_iam_role_policy_attachment" "ecr_read_only" {
  role       = aws_iam_role.ec2_ecr_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# 3. The "Instance Profile" (The container that carries the role to the EC2)
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "libricore-ec2-profile"
  role = aws_iam_role.ec2_ecr_role.name
}