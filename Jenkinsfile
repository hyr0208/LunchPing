pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'lunchping'
        VITE_KAKAO_REST_API_KEY = '68908f9163ef73aac83e9ae94096f936'
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
                    sh 'docker build --build-arg VITE_KAKAO_REST_API_KEY=${VITE_KAKAO_REST_API_KEY} -t ${DOCKER_IMAGE}:latest .'
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
