# 배포 가이드

## 젠킨스 배포 설정

### 1. 젠킨스 파이프라인 설정

1. 젠킨스에서 새 파이프라인 작업 생성
2. "Pipeline script from SCM" 선택
3. SCM: Git
4. Repository URL: 프로젝트 Git 저장소 URL
5. Branch: `develop` (또는 배포할 브랜치)
6. Script Path: `Jenkinsfile`

### 2. 환경 변수 설정

젠킨스 관리 → 시스템 설정 → Global properties → Environment variables에서 설정하거나, Jenkinsfile의 `environment` 섹션을 수정:

```groovy
DEPLOY_HOST = '192.168.0.18'
DEPLOY_PORT = '22'
DEPLOY_USER = 'deploy'  // 서버 사용자명
DEPLOY_PATH = '/var/www/lunchping'  // 배포 경로
```

### 3. SSH 키 설정

젠킨스 서버에서 배포 대상 서버로 SSH 접속이 가능해야 합니다:

```bash
# 젠킨스 서버에서 실행
ssh-keygen -t rsa
ssh-copy-id -p 22 deploy@192.168.0.18
```

### 4. 서버 설정

배포 대상 서버(192.168.0.18)에서:

1. Nginx 또는 Apache 설정 (예시):

```nginx
server {
    listen 3004;
    server_name lunchping.yyyerin.co.kr;
    
    root /var/www/lunchping;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass https://dapi.kakao.com;
        proxy_set_header Host dapi.kakao.com;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

2. 배포 디렉토리 권한 설정:

```bash
sudo mkdir -p /var/www/lunchping
sudo chown -R deploy:deploy /var/www/lunchping
```

## 수동 배포

### deploy.sh 스크립트 사용

```bash
# 스크립트 수정 (필요시)
nano deploy.sh

# 배포 실행
./deploy.sh
```

### 수동 배포 단계

```bash
# 1. 의존성 설치
npm ci

# 2. 빌드
npm run build

# 3. 서버로 전송
rsync -avz --delete dist/ deploy@192.168.0.18:/var/www/lunchping/
```

## 환경 변수

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_KAKAO_REST_API_KEY=your_kakao_api_key
```

빌드 시 환경 변수가 포함됩니다.

## 배포 확인

배포 후 확인:
- http://192.168.0.18:3004
- https://lunchping.yyyerin.co.kr
