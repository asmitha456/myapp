pipeline {
    agent any
    tools {
        maven 'mymaven'
    }
    environment {
        DOCKER_REGISTRY = 'your-registry.com'
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/myapp-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/myapp-frontend:${BUILD_NUMBER}"
        DB_IMAGE = "${DOCKER_REGISTRY}/myapp-db:${BUILD_NUMBER}"
        K8S_NAMESPACE = 'myapp'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'mvn test'
                        }
                    }
                }
                stage('Frontend Tests') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${BACKEND_IMAGE} ."
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE} ."
                        }
                    }
                }
                stage('Build Database') {
                    steps {
                        dir('database') {
                            sh "docker build -t ${DB_IMAGE} ."
                        }
                    }
                }
            }
        }
        
        stage('Push Images') {
            steps {
                withDockerRegistry([credentialsId: 'docker-registry-cred', url: "https://${DOCKER_REGISTRY}"]) {
                    sh "docker push ${BACKEND_IMAGE}"
                    sh "docker push ${FRONTEND_IMAGE}"
                    sh "docker push ${DB_IMAGE}"
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withKubeConfig([credentialsId: 'kubeconfig-cred']) {
                    sh """
                        kubectl set image deployment/backend backend=${BACKEND_IMAGE} -n ${K8S_NAMESPACE}
                        kubectl set image deployment/frontend frontend=${FRONTEND_IMAGE} -n ${K8S_NAMESPACE}
                        kubectl set image statefulset/mysql mysql=${DB_IMAGE} -n ${K8S_NAMESPACE}-database
                    """
                }
            }
        }
        
        stage('Smoke Test') {
            steps {
                sh '''
                    sleep 10
                    curl -f http://backend-service:8080/api/users || exit 1
                    curl -f http://frontend-service || exit 1
                '''
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
            // Cleanup old images
            sh "docker image prune -f"
        }
        failure {
            echo 'Deployment failed!'
            // Rollback
            withKubeConfig([credentialsId: 'kubeconfig-cred']) {
                sh "kubectl rollout undo deployment/backend -n ${K8S_NAMESPACE}"
                sh "kubectl rollout undo deployment/frontend -n ${K8S_NAMESPACE}"
            }
        }
    }
}
