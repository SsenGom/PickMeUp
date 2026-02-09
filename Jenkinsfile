pipeline {
    agent any
    
    environment {
        // Docker Hub 자격증명 (Jenkins Credentials에 등록 필요)
        DOCKER_HUB_CREDENTIAL = 'dockerhub-credential'
        DOCKER_HUB_USERNAME = 'your-dockerhub-username'
        
        // 이미지 이름
        BACKEND_IMAGE = "${DOCKER_HUB_USERNAME}/pickmeup-backend"
        FRONTEND_IMAGE = "${DOCKER_HUB_USERNAME}/pickmeup-frontend"
        
        // 버전 태그 (Git 커밋 해시 사용)
        VERSION = "${env.GIT_COMMIT.take(7)}"
        
        // 브랜치별 환경
        DEPLOY_ENV = "${env.BRANCH_NAME == 'main' ? 'production' : env.BRANCH_NAME == 'develop' ? 'staging' : 'dev'}"
    }
    
    tools {
        jdk 'JDK17'
        nodejs 'NodeJS18'
    }
    
    stages {
        // ==================== 1. 체크아웃 ====================
        stage('Checkout') {
            steps {
                script {
                    echo "🔄 Branch: ${env.BRANCH_NAME}"
                    echo "📦 Commit: ${env.GIT_COMMIT}"
                    echo "🌍 Environment: ${DEPLOY_ENV}"
                }
                checkout scm
            }
        }
        
        // ==================== 2. 백엔드 빌드 & 테스트 ====================
        stage('Backend Build & Test') {
            steps {
                dir('backend') {
                    script {
                        echo '🔨 Building Backend...'
                        sh 'chmod +x gradlew'
                        sh './gradlew clean build'
                        
                        echo '🧪 Running Backend Tests...'
                        sh './gradlew test'
                        
                        // JaCoCo 커버리지 리포트
                        sh './gradlew jacocoTestReport'
                    }
                }
            }
            post {
                always {
                    // 테스트 결과 발행
                    junit 'backend/build/test-results/test/*.xml'
                    
                    // 커버리지 리포트 발행
                    jacoco(
                        execPattern: 'backend/build/jacoco/*.exec',
                        classPattern: 'backend/build/classes',
                        sourcePattern: 'backend/src/main/java'
                    )
                }
            }
        }
        
        // ==================== 3. 프론트엔드 빌드 & 테스트 ====================
        stage('Frontend Build & Test') {
            steps {
                dir('frontend') {
                    script {
                        echo '🔨 Building Frontend...'
                        sh 'npm ci'
                        
                        echo '🧪 Running Frontend Linter...'
                        sh 'npm run lint || true'  // 실패해도 계속
                        
                        echo '📦 Building Frontend...'
                        sh 'npm run build'
                    }
                }
            }
        }
        
        // ==================== 4. 코드 품질 분석 (SonarQube - 선택) ====================
        stage('Code Quality Analysis') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '📊 Running SonarQube Analysis...'
                    // SonarQube 설정이 있다면
                    // withSonarQubeEnv('SonarQube') {
                    //     sh './gradlew sonarqube'
                    // }
                }
            }
        }
        
        // ==================== 5. Docker 이미지 빌드 ====================
        stage('Build Docker Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo '🐳 Building Docker Images...'
                    
                    // 백엔드 이미지
                    sh """
                        cd backend
                        docker build -t ${BACKEND_IMAGE}:${VERSION} .
                        docker tag ${BACKEND_IMAGE}:${VERSION} ${BACKEND_IMAGE}:latest
                    """
                    
                    // 프론트엔드 이미지
                    sh """
                        cd frontend
                        docker build -t ${FRONTEND_IMAGE}:${VERSION} .
                        docker tag ${FRONTEND_IMAGE}:${VERSION} ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        // ==================== 6. Docker Hub Push ====================
        stage('Push to Docker Hub') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo '📤 Pushing to Docker Hub...'
                    
                    docker.withRegistry('https://registry.hub.docker.com', DOCKER_HUB_CREDENTIAL) {
                        sh "docker push ${BACKEND_IMAGE}:${VERSION}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        sh "docker push ${FRONTEND_IMAGE}:${VERSION}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }
        
        // ==================== 7. 배포 (Staging) ====================
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '🚀 Deploying to Staging...'
                    
                    // SSH로 스테이징 서버 배포
                    sshagent(credentials: ['staging-server-ssh']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@staging-server.com '
                                cd /app/pickmeup &&
                                git pull origin develop &&
                                docker-compose pull &&
                                docker-compose up -d
                            '
                        """
                    }
                }
            }
        }
        
        // ==================== 8. 배포 (Production) ====================
        stage('Deploy to Production') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚀 Deploying to Production...'
                    
                    // 배포 승인 대기
                    input message: '프로덕션 배포를 진행하시겠습니까?', ok: 'Deploy'
                    
                    // SSH로 프로덕션 서버 배포
                    sshagent(credentials: ['production-server-ssh']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ubuntu@production-server.com '
                                cd /app/pickmeup &&
                                git pull origin main &&
                                export VERSION=${VERSION} &&
                                docker-compose pull &&
                                docker-compose up -d &&
                                
                                # 헬스체크
                                sleep 10 &&
                                curl -f http://localhost:8080/actuator/health || exit 1
                            '
                        """
                    }
                }
            }
        }
        
        // ==================== 9. 슬랙 알림 (선택) ====================
        stage('Notify Slack') {
            when {
                anyOf {
                    branch 'main'
                    branch 'develop'
                }
            }
            steps {
                script {
                    def status = currentBuild.result ?: 'SUCCESS'
                    def color = status == 'SUCCESS' ? 'good' : 'danger'
                    def message = """
                        *${status}*: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'
                        Branch: ${env.BRANCH_NAME}
                        Commit: ${env.GIT_COMMIT.take(7)}
                        Environment: ${DEPLOY_ENV}
                        (<${env.BUILD_URL}|Open>)
                    """
                    
                    // Slack 플러그인 필요
                    // slackSend(color: color, message: message, channel: '#deployments')
                }
            }
        }
    }
    
    // ==================== Post Actions ====================
    post {
        success {
            echo '✅ Pipeline succeeded!'
        }
        failure {
            echo '❌ Pipeline failed!'
            
            // 이메일 알림 (선택)
            // emailext(
            //     subject: "FAILED: Job '${env.JOB_NAME} [${env.BUILD_NUMBER}]'",
            //     body: "Check console output at ${env.BUILD_URL}",
            //     to: 'team@pickmeup.com'
            // )
        }
        always {
            // 워크스페이스 정리
            cleanWs()
        }
    }
}
