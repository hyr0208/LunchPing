pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'lunchping'
        BACKEND_IMAGE = 'lunchping-backend'
        VITE_KAKAO_REST_API_KEY = '68908f9163ef73aac83e9ae94096f936'
        DOCKER_NETWORK = 'lunchping-net'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Network') {
            steps {
                script {
                    sh 'docker network create ${DOCKER_NETWORK} || true'
                }
            }
        }
        
        stage('Build Docker Images') {
            steps {
                script {
                    // Frontend
                    sh 'docker build --build-arg VITE_KAKAO_REST_API_KEY=${VITE_KAKAO_REST_API_KEY} -t ${DOCKER_IMAGE}:latest .'
                    // Backend
                    sh 'docker build -t ${BACKEND_IMAGE}:latest ./backend'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop existing containers
                    sh 'docker stop lunchping lunchping-backend || true'
                    sh 'docker rm lunchping lunchping-backend || true'

                    // Run backend container
                    sh '''
                        docker run -d \
                            --name lunchping-backend \
                            --network ${DOCKER_NETWORK} \
                            --restart unless-stopped \
                            -e DB_HOST=aws-1-ap-northeast-2.pooler.supabase.com \
                            -e DB_PORT=5432 \
                            -e DB_USERNAME=postgres.sufdhcqeqsggecmatreg \
                            -e DB_PASSWORD=diflsdl5490! \
                            -e DB_DATABASE=postgres \
                            -e GOOGLE_PLACES_API_KEY=AIzaSyDxj7jSpd1Dx-e380wR_m71c4wWqIDdfm0 \
                            ${BACKEND_IMAGE}:latest
                    '''
                    
                    // Run frontend container
                    sh '''
                        docker run -d \
                            --name lunchping \
                            --network ${DOCKER_NETWORK} \
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
