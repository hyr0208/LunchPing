# 🍽️ LunchPing (오늘 점심 핑)

> "오늘 점심 뭐 먹지?" 고민을 해결해주는 내 주변 맛집 추천 서비스

**LunchPing**은 현재 위치를 기반으로 주변 음식점을 카테고리별로 검색하고 추천해주는 웹 애플리케이션입니다.  
직관적인 UI와 카카오맵 기반의 정확한 위치 정보를 통해 쉽고 빠르게 점심 메뉴를 결정할 수 있습니다.

🔗 **Live Service**: [https://lunchping.yyyerin.co.kr](https://lunchping.yyyerin.co.kr)

## ✨ 주요 기능

- **📍 내 주변 맛집 찾기**: 사용자 위치 기반 반경 1km 이내 음식점 검색
- **📂 카테고리 필터**: 한식, 중식, 일식, 양식, 분식, 카페 등 원하는 종류별 모아보기
- **🎲 랜덤 점심 추천**: 결정장애를 위한 랜덤 메뉴 추천 기능 (예정)
- **📱 반응형 웹 디자인**: 데스크탑, 태블릿, 모바일 모든 환경 지원

## 🛠️ 기술 스택 (Tech Stack)

### Frontend

- **Framework**: React 19, Vite 5
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React (Icons)
- **API**: Kakao Maps API (Local Search)

### DevOps & Deployment

- **CI/CD**: Jenkins
- **Container**: Docker
- **Server**: Nginx (Reverse Proxy)
- **Infrastructure**: On-premise (NAS), Cloudflare Tunnel

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
npm install
```

3. 환경 변수 설정
   최상위 폴더에 `.env` 파일을 생성하고 Kakao API 키를 입력하세요.

```env
VITE_KAKAO_REST_API_KEY=your_kakao_api_key
```

4. 개발 서버 실행

```bash
npm run dev
```

## 🐳 배포 (Deployment)

이 프로젝트는 **Jenkins**와 **Docker**를 통해 자동 배포됩니다.

### 배포 파이프라인 구조

1. **GitHub Push**: `main` 브랜치에 코드가 푸시되면 Jenkins 트리거
2. **Docker Build**: `node:20-alpine` 환경에서 React 앱 빌드 (Vite)
3. **Deploy Container**: 기존 컨테이너 중단 및 새로운 Nginx 컨테이너 실행
4. **Proxy Setup**: Nginx가 Kakao API 요청을 프록시하여 CORS 문제 해결

### 주요 명령어

```bash
# 로컬에서 빌드 테스트
npm run build
npm run preview

# 도커 이미지 빌드 (수동)
docker build --build-arg VITE_KAKAO_REST_API_KEY=... -t lunchping .
```

## 📝 라이선스

This project is [MIT](LICENSE) licensed.
