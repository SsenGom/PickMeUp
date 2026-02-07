# ==================== 빌드 스테이지 ====================
FROM node:18-alpine AS builder

WORKDIR /app

# 의존성 설치 (캐시 활용)
COPY package*.json ./
RUN npm ci

# 소스 복사 및 빌드
COPY . .
RUN npm run build

# ==================== 실행 스테이지 (Nginx) ====================
FROM nginx:alpine

# Nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 빌드된 파일 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
