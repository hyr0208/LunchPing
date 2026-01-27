pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'lunchping'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop existing container
                    sh 'docker stop lunchping || true'
                    sh 'docker rm lunchping || true'
                    
                    // Run new container (without custom network)
                    sh '''
                        docker run -d \
                            --name lunchping \
                            --restart unless-stopped \
                            -p 3004:80 \
                            ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    // Remove dangling images
                    sh 'docker image prune -f'
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ LunchPing 배포 성공! https://lunchping.yyyerin.co.kr'
        }
        failure {
            echo '❌ 배포 실패'
        }
    }
}
