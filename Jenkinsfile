pipeline {
    agent any
    
    environment {
        // AWS & ECR Configuration
        REGISTRY    = "086627396918.dkr.ecr.ap-south-1.amazonaws.com"
        REGION      = "ap-south-1"
        EC2_IP      = "65.0.54.172"
        EC2_USER    = "ec2-user"
        // AWS Credentials ID from Jenkins Manage Credentials
        AWS_CREDS   = "aws-credentials" 
        // SSH Key ID from Jenkins Manage Credentials
        SSH_CREDS   = "ec2-ssh-key"
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Shanilka-Yapa/Libricore.git',
                    credentialsId: 'github-tokennew'
            }
        }

        stage('Build & Push to ECR') {
    steps {
        withCredentials([[$class: 'AmazonWebServicesCredentialsBinding', credentialsId: "${AWS_CREDS}"]]) {
            sh """
            aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${REGISTRY}
            
            # Add --no-cache here to force a fresh build with your new IP
            docker build --no-cache -t ${REGISTRY}/my-backend:latest ./backend
            docker build --no-cache -t ${REGISTRY}/my-frontend:latest ./frontend
            
            # Push images to AWS ECR
            docker push ${REGISTRY}/my-backend:latest
            docker push ${REGISTRY}/my-frontend:latest
            """
            }
        }
    }   

        stage('Deploy to EC2') {
            steps {
                sshagent(["${SSH_CREDS}"]) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} << 'EOF'
                        # 1. Login to ECR on the remote EC2
                        aws ecr get-login-password --region ${REGION} | docker login --username AWS --password-stdin ${REGISTRY}
                        
                        # 2. Navigate to app folder
                        cd ~/app
                        
                        # 3. Pull latest images and restart
                        docker-compose pull
                        docker-compose up -d
                        
                        # 4. Clean up old unused images to save disk space
                        docker image prune -f
                    EOF
                    """
                }
            }
        }

        stage('Verify Remote') {
            steps {
                sshagent(["${SSH_CREDS}"]) {
                    sh "ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_IP} 'docker ps'"
                }
            }
        }
    }

    post {
        success {
            echo '✅ Remote deployment to AWS successful!'
        }
        failure {
            echo '❌ Deployment failed. Check Jenkins logs and EC2 connection.'
        }
    }
}