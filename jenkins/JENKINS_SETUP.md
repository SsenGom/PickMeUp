# Jenkins CI/CD 설정 가이드 (PickMeUp)

## 1. Jenkins 실행 (Docker)

```bash
cd jenkins
docker compose -f docker-compose.jenkins.yml up -d
```

초기 비밀번호 확인:
```bash
docker exec pickmeup-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

→ `http://localhost:8080` 접속 후 초기 설정

---

## 2. 필수 플러그인 설치
Jenkins 관리 → Plugin Manager → Available에서 설치:
- **Pipeline**
- **Git Plugin**
- **GitHub Plugin**
- **Docker Pipeline**
- **Credentials Binding Plugin**
- **GitHub Branch Source** (멀티브랜치 쓸 경우)

---

## 3. Credentials 등록
Jenkins 관리 → Credentials → Global → Add Credentials
Kind: **Secret text**

| Credentials ID                 | 설명                |
|--------------------------------|---------------------|
| `pickmeup-db-username`         | MySQL 유저명        |
| `pickmeup-db-password`         | MySQL 비밀번호      |
| `pickmeup-mongo-username`      | MongoDB 유저명      |
| `pickmeup-mongo-password`      | MongoDB 비밀번호    |
| `pickmeup-mysql-root-password` | MySQL root 비밀번호 |
| `pickmeup-redis-password`      | Redis 비밀번호      |
| `pickmeup-jwt-secret`          | JWT Secret Key      |
| `pickmeup-mail-username`       | SMTP 이메일         |
| `pickmeup-mail-password`       | SMTP 앱 비밀번호    |
| `pickmeup-kakao-key`           | Kakao REST API Key  |
| `pickmeup-openai-key`          | OpenAI API Key      |

---

## 4. Pipeline Job 생성
1. 새 Item → **Multibranch Pipeline** 선택 (브랜치별 자동 감지)
2. Branch Sources → **GitHub** 추가
   - GitHub 토큰 Credentials 추가
   - Repository URL 입력
3. Build Configuration → Script Path: `Jenkinsfile`
4. Scan Multibranch Pipeline Triggers → 주기 설정 (ex. 1분)

---

## 5. GitHub Webhook 설정
GitHub repo → Settings → Webhooks → Add webhook

| 항목 | 값 |
|------|-----|
| Payload URL | `http://<서버IP>:8080/github-webhook/` |
| Content type | `application/json` |
| Events | **Just the push event** |

> Jenkins가 로컬이면 ngrok으로 외부 노출:
> ```bash
> ngrok http 8080
> # Payload URL에 ngrok URL 넣으면 됨
> ```

---

## 6. Docker-in-Docker 확인
Jenkins 컨테이너 안에서 Docker 명령어가 실행되어야 함.
정상 여부 확인:
```bash
docker exec pickmeup-jenkins docker ps
```
에러 나면 `/var/run/docker.sock` 마운트 확인.

---

## 7. 브랜치 전략
| 브랜치       | 동작                                  |
|--------------|---------------------------------------|
| `main`       | 테스트 → 빌드 → Docker → **배포 + 헬스체크** |
| `develop`    | 테스트 → 빌드만 (배포 X)             |
| `feature/*`  | 테스트만                              |
