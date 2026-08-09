# Database 분리 가이드 (Dev/Prod)

## 왜 분리해야 하나?

### 문제 상황:
```
현재: 단일 DB (forestea)
├─ Sandbox 개발 중 → X5JX1NZNZ4BQ1 토큰 저장
├─ Production 전환 → M9MMNPP2ERA71 필요
└─ 충돌! merchantIdMismatch: true
```

### 해결책:
```
분리 후:
├─ forestea_dev → Sandbox 데이터
└─ forestea_prod → Production 데이터
```

---

## 단계별 가이드

### STEP 1: 데이터베이스 생성

```bash
psql postgresql://forestea:forestea@localhost:5432/postgres

CREATE DATABASE forestea_dev;
CREATE DATABASE forestea_prod;

\l  # 확인
\q
```

---

### STEP 2: 환경 변수 수정

#### apps/api/.env.sandbox
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_dev"
# ... 나머지 동일
```

#### apps/api/.env.prod
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_prod"
# ... 나머지 동일
```

---

### STEP 3: 스키마 적용

#### Dev DB:
```bash
cd /Users/qbnv68/Developer/forestea/packages/db

DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_dev" \
  npx prisma db push
```

#### Prod DB:
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_prod" \
  npx prisma db push
```

---

### STEP 4: Web 환경 변수 (선택사항)

#### apps/web/.env.local (Dev)
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_dev"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

#### apps/web/.env.production (새로 생성)
```bash
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea_prod"
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

### STEP 5: OAuth 재연결

#### Sandbox:
```bash
cd apps/api
pnpm dev  # Sandbox

# http://localhost:3000/admin/setting
# "Clover 계정 연동하기"
# Sandbox 매장으로 승인
```

#### Production:
```bash
cd apps/api
pnpm dev-production  # Production

# http://localhost:3000/admin/setting
# "Clover 계정 연동하기"
# Production 매장으로 승인
```

---

### STEP 6: 확인

#### Dev 확인:
```bash
curl http://localhost:4000/health
# sandbox: true
# merchantId: X5JX1NZNZ4BQ1
# merchantIdMismatch: false ✅
```

#### Prod 확인:
```bash
curl http://localhost:4000/health
# sandbox: false
# merchantId: M9MMNPP2ERA71
# merchantIdMismatch: false ✅
```

---

## 전환 방법

### Sandbox로 개발:
```bash
터미널1: cd apps/api && pnpm dev
터미널2: cd apps/web && pnpm dev
```

### Production 테스트:
```bash
터미널1: cd apps/api && pnpm dev-production
터미널2: cd apps/web && pnpm dev
```

---

## 추가 팁

### DB 초기화 (개발 중)

```bash
# Dev DB만 초기화
psql postgresql://forestea:forestea@localhost:5432/forestea_dev \
  -c "TRUNCATE TABLE orders, order_items, favorites CASCADE;"

# Prod는 안전!
```

### 백업

```bash
# Prod DB 백업
pg_dump postgresql://forestea:forestea@localhost:5432/forestea_prod \
  > backup_$(date +%Y%m%d).sql

# 복구
psql postgresql://forestea:forestea@localhost:5432/forestea_prod \
  < backup_20260809.sql
```

---

## 체크리스트

- [ ] forestea_dev DB 생성
- [ ] forestea_prod DB 생성
- [ ] .env.sandbox DATABASE_URL 수정
- [ ] .env.prod DATABASE_URL 수정
- [ ] Dev DB 스키마 적용
- [ ] Prod DB 스키마 적용
- [ ] Sandbox OAuth 연결
- [ ] Production OAuth 연결
- [ ] Health Check 확인
- [ ] 메뉴 API 테스트
