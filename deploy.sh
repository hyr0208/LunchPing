#!/bin/bash

# 배포 설정
DEPLOY_HOST="192.168.0.18"
DEPLOY_PORT="22"
DEPLOY_USER="deploy"  # 서버 사용자명에 맞게 수정 필요
DEPLOY_PATH="/var/www/lunchping"  # 배포 경로에 맞게 수정 필요
BUILD_DIR="dist"

# 색상 출력
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== LunchPing 배포 스크립트 ===${NC}\n"

# 1. 의존성 설치
echo -e "${YELLOW}[1/4] 의존성 설치 중...${NC}"
if ! npm ci; then
    echo -e "${RED}의존성 설치 실패${NC}"
    exit 1
fi

# 2. 빌드
echo -e "${YELLOW}[2/4] 프로젝트 빌드 중...${NC}"
if ! npm run build; then
    echo -e "${RED}빌드 실패${NC}"
    exit 1
fi

# 3. 빌드 결과 확인
if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}빌드 디렉토리를 찾을 수 없습니다: $BUILD_DIR${NC}"
    exit 1
fi

# 4. 서버로 배포
echo -e "${YELLOW}[3/4] 서버로 배포 중...${NC}"
echo -e "대상: ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}"

# 배포 디렉토리 생성
ssh -p ${DEPLOY_PORT} ${DEPLOY_USER}@${DEPLOY_HOST} "mkdir -p ${DEPLOY_PATH}"

# 파일 전송
if rsync -avz --delete -e "ssh -p ${DEPLOY_PORT}" \
    ${BUILD_DIR}/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_PATH}/; then
    echo -e "${GREEN}[4/4] 배포 완료!${NC}"
    echo -e "${GREEN}배포 주소: http://${DEPLOY_HOST}:3004${NC}"
    echo -e "${GREEN}도메인: lunchping.yyyerin.co.kr${NC}"
else
    echo -e "${RED}배포 실패${NC}"
    exit 1
fi
