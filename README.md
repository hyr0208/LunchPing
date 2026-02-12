# 🍽️ LunchPing (오늘 점심 핑)

> "오늘 점심 뭐 먹지?" 고민을 해결해주는 내 주변 맛집 추천 서비스

**LunchPing**은 현재 위치를 기반으로 주변 음식점을 카테고리별로 검색하고 추천해주는 웹 애플리케이션입니다.  
직관적인 UI와 카카오맵 기반의 정확한 위치 정보를 통해 쉽고 빠르게 점심 메뉴를 결정할 수 있습니다.

🔗 **Live Service**: [https://lunchping.yyyerin.co.kr](https://lunchping.yyyerin.co.kr)

## ✨ 주요 기능

- **📍 내 주변 맛집 찾기**: 사용자 위치 기반 반경 1km 이내 음식점 검색
- **� 키워드 검색**: 음식점 이름 또는 메뉴로 직접 검색
- **�📂 카테고리 필터**: 한식, 중식, 일식, 양식, 분식, 카페 등 원하는 종류별 모아보기
- **🕐 영업 중 필터**: 현재 영업 중인 음식점만 필터링
- **🎲 랜덤 점심 추천**: 결정장애를 위한 랜덤 메뉴 추천 기능
- **🗺️ 지도 보기**: 카카오맵 기반 지도 뷰에서 주변 맛집 한눈에 확인
- **📍 기본 위치 지원**: 위치 권한을 거부해도 서울 시청 기준으로 검색 가능
- **📱 반응형 웹 디자인**: 데스크탑, 태블릿, 모바일 모든 환경 지원

## 🛠️ 기술 스택 (Tech Stack)

### Frontend

- **Framework**: React 19, Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **API**: Kakao Maps API (Local Search)

### Backend

- **Framework**: NestJS 11
- **Language**: TypeScript
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Storage**: MinIO (이미지 저장)
- **HTTP Client**: Axios

### DevOps & Deployment

- **CI/CD**: Jenkins
- **Container**: Docker, Docker Compose
- **Server**: Nginx (Reverse Proxy)
- **Infrastructure**: On-premise (NAS), Cloudflare Tunnel

## 📁 프로젝트 구조

```
LunchPing/
├── src/                    # Frontend 소스
│   ├── components/         # React 컴포넌트
│   │   ├── layout/         #   - Header 등 레이아웃
│   │   ├── map/            #   - KakaoMap 지도 컴포넌트
│   │   ├── restaurant/     #   - 음식점 카드
│   │   └── ui/             #   - 검색바, 필터, 모달 등
│   ├── hooks/              # Custom Hooks (위치, 음식점 조회)
│   ├── services/           # API 서비스 (카카오 API)
│   ├── types/              # TypeScript 타입 정의
│   └── utils/              # 유틸리티 함수
├── backend/                # Backend 소스 (NestJS)
│   └── src/                # 서버 로직
├── Dockerfile              # Frontend Docker 이미지
├── docker-compose.yml      # 전체 서비스 오케스트레이션
├── nginx.conf              # Nginx 설정
└── Jenkinsfile             # CI/CD 파이프라인
```

## 🚀 시작하기 (Getting Started)

### 사전 요구사항 (Prerequisites)

- Node.js 18+
- npm

### 설치 및 실행 (Installation)

1. 리포지토리 클론

```bash
git clone https://github.com/hyr0208/LunchPing.git
cd LunchPing
```

2. 의존성 설치

```bash
# Frontend
npm install

# Backend
cd backend && npm install
```

3. 환경 변수 설정

   **Frontend** - 최상위 폴더에 `.env` 파일 생성:

```env
VITE_KAKAO_REST_API_KEY=your_kakao_api_key
```

**Backend** - `backend/.env` 파일 생성:

```env
DB_HOST=your_db_host
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=your_db_name
KAKAO_REST_API_KEY=your_kakao_api_key
```

4. 개발 서버 실행

```bash
# Frontend
npm run dev

# Backend
cd backend && npm run start:dev
```

## 🐳 배포 (Deployment)

이 프로젝트는 **Jenkins**와 **Docker Compose**를 통해 자동 배포됩니다.

### 배포 파이프라인 구조

1. **GitHub Push**: `main` 브랜치에 코드가 푸시되면 Jenkins 트리거
2. **Docker Build**: Frontend(Vite) + Backend(NestJS) + MinIO 이미지 빌드
3. **Deploy**: Docker Compose로 전체 서비스 실행
4. **Proxy Setup**: Nginx가 API 요청을 백엔드로 프록시

### 주요 명령어

```bash
# 로컬에서 빌드 테스트
npm run build
npm run preview

# Docker Compose로 전체 실행
docker-compose up -d --build
```

## 👩‍💻 만든 사람

**yyyerin**

## 📝 라이선스

This project is [MIT](LICENSE) licensed.
