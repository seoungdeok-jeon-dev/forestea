# Clover Production 매장 연결 가이드

실제 Clover 매장에 Forestea 앱을 연결하는 완전한 가이드입니다.

---

## 📚 용어 정리 (중요!)

### 1. Clover Account 종류

| 계정 유형 | 용도 | URL |
|---------|------|-----|
| **Merchant Account** | 매장 주인 계정 (POS 사용) | https://www.clover.com/setupapp |
| **Developer Account** | 앱 개발자 계정 | https://www.clover.com/developers |

### 2. Token/Key 종류 (헷갈리기 쉬움!)

| 이름 | 어디서 발급 | 용도 | 우리 프로젝트 필요 여부 |
|------|-----------|------|---------------------|
| **API Token (Legacy)** | Merchant Dashboard | 직접 API 호출 (구식) | ❌ **불필요** |
| **OAuth Access Token** | OAuth Flow | 동적으로 발급 (현대적) | ✅ 자동 발급됨 |
| **PAKMS Token** | Developer Dashboard | 카드 결제 토큰화 | ✅ **필수** |
| **App ID** | Developer Dashboard | 앱 식별자 | ✅ **필수** |
| **App Secret** | Developer Dashboard | 앱 비밀키 | ✅ **필수** |

---

## 🎯 답변: API Tokens 페이지는 필요 없습니다!

**https://www.clover.com/setupapp/m/M9MMNPP2ERA71/api-tokens** 
→ 이 페이지는 **Legacy API Token**을 만드는 곳입니다.

### ❌ 사용하지 않는 이유:
- 우리는 **OAuth 2.0** 방식을 사용합니다
- OAuth는 자동으로 `access_token`을 발급하고 DB에 저장합니다
- Legacy API Token은 보안상 권장되지 않습니다

### ✅ 실제로 필요한 것:
1. **Developer Account**에서 **App** 생성
2. **PAKMS Token** (Ecommerce API Key) 발급
3. **OAuth Flow**로 매장과 연결

---

## 📋 실제 설정 단계 (Step by Step)

---

## STEP 1: Developer Account 만들기

### 1-1. 계정 생성
1. **https://www.clover.com/developers** 접속
2. 오른쪽 상단 **"Sign In"** 클릭
3. 계정이 없으면 **"Create Account"**
   - 이메일, 비밀번호 입력
   - 개발자 약관 동의

### 1-2. Developer Dashboard 접속
로그인 후: **https://www.clover.com/developer-home/apps**

---

## STEP 2: Production App 만들기

### 2-1. Create App
1. Developer Dashboard에서 **"Create App"** 클릭
2. App 정보 입력:

```
App Name: Forestea
App Description: Online ordering and payment for Forestea cafe
Category: Online Ordering
```

3. **"Create App"** 클릭

### 2-2. 중요: Production vs Sandbox 선택

앱 생성 후 화면 상단에 환경 선택 드롭다운이 있습니다:

```
[Sandbox ▼]  또는  [Production ▼]
```

⚠️ **"Production"을 선택하세요!**

---

## STEP 3: App Settings 설정

앱 생성 후 왼쪽 메뉴에서 설정들을 채워야 합니다.

### 3-1. App Settings → REST Configuration

#### A. Site URL
```
개발 중: http://localhost:4000
배포 후: https://api.your-domain.com
```
**역할**: 앱의 메인 URL (Clover가 redirect 허용 여부 판단)

#### B. Default OAuth Response
```
☑ Code (권장)
```

#### C. Redirect URIs
```
http://localhost:4000/auth     (개발용)
https://api.your-domain.com/auth   (배포용)
```

⚠️ **정확히 일치해야 합니다!** 슬래시 하나라도 틀리면 OAuth 실패

#### D. CORS Domains (선택사항)
```
http://localhost:3000
https://your-domain.com
```

**저장** 버튼 클릭!

### 3-2. App Credentials 복사

REST Configuration 페이지 상단에 표시됩니다:

```
App ID: ABC123XYZ456
App Secret: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

📋 **메모장에 복사하세요!** → `.env.prod`에 사용

---

## STEP 4: Permissions 설정

왼쪽 메뉴 **"Permissions"** 클릭

### 필수 권한 체크:

```
☑ Merchant Information (Read)     - 매장 정보
☑ Inventory (Read)                - 메뉴 항목 조회
☑ Orders (Read)                   - 주문 조회
☑ Orders (Write)                  - 주문 생성
☑ Payments (Process Credit Cards) - 결제 처리
```

**저장** 버튼 클릭!

---

## STEP 5: PAKMS Token 발급 (중요!)

### 5-1. Setup → Ecommerce Configuration

왼쪽 메뉴에서 **"Setup"** → **"Ecommerce Configuration"** 클릭

### 5-2. Generate PAKMS
1. **"Create PAKMS"** 또는 **"Generate API Token"** 버튼 클릭
2. Token이 생성되면 **즉시 복사**

```
예시: dacd40737920f6a9e75382b18bd71df0
```

⚠️ **한 번만 표시됩니다!** 꼭 메모장에 저장하세요.

### 🤔 PAKMS가 뭐죠?

**PAKMS = Tokenization Key**

- **역할**: 고객의 카드 정보를 안전하게 토큰으로 변환
- **언제 사용**: 결제 페이지에서 카드 번호 입력 시
- **보안**: 실제 카드 번호는 우리 서버를 거치지 않고 Clover로 직행
- **Public Key**: 브라우저에 노출되어도 안전 (읽기 전용)

```javascript
// 브라우저에서 사용 예시
clover.createToken({
  cardNumber: "4111111111111111",
  apiKey: "YOUR_PAKMS_KEY"  // 이게 PAKMS
});
// → 안전한 토큰 반환: "clv_xxxxxx"
```

---

## STEP 6: `.env.prod` 파일 작성

이제 발급받은 모든 정보를 환경변수 파일에 넣습니다.

### apps/api/.env.prod

```bash
# Database
DATABASE_URL="postgresql://forestea:forestea@localhost:5432/forestea"
PORT=4000

# Web origin (CORS)
WEB_ORIGIN="http://localhost:3000"  # 개발 중
# WEB_ORIGIN="https://your-domain.com"  # 배포 후

# ============================================
# Clover App Credentials (Developer Dashboard에서 복사)
# ============================================

# App ID (REST Configuration 페이지)
CLOVER_APP_ID="ABC123XYZ456"

# App Secret (REST Configuration 페이지)
CLOVER_APP_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# Redirect URI (REST Configuration에 등록한 것과 동일해야 함!)
CLOVER_REDIRECT_URI="http://localhost:4000/auth"

# ============================================
# Clover Environment
# ============================================

# 매장 ID (아직 모르면 비워둠 - OAuth 후 자동 저장됨)
CLOVER_MERCHANT_ID=""

# Production 모드 (중요!)
CLOVER_SANDBOX="false"

# ============================================
# Ecommerce API Key (PAKMS)
# ============================================

# PAKMS Token (Ecommerce Configuration에서 복사)
CLOVER_ECOMMERCE_API_KEY="dacd40737920f6a9e75382b18bd71df0"

# ============================================
# Internal Security
# ============================================

# Web ↔ API 서버 간 통신용 (이미 있는 값 유지)
INTERNAL_API_SECRET="83df2919b4d58ebdafe21374235a032f94ddf2c38706006af5f3dba39963bed8"
```

---

## STEP 7: OAuth로 매장 연결

이제 앱을 실제 매장에 "설치"하는 과정입니다.

### 7-1. Production API 서버 실행

```bash
cd /Users/qbnv68/Developer/forestea/apps/api
pnpm dev-production
```

서버가 시작되면:
```
Server listening on port 4000
Clover Environment: production
```

### 7-2. Authorization URL 생성

터미널에서:
```bash
curl http://localhost:4000/auth/url
```

반환 예시:
```json
{
  "url": "https://www.clover.com/oauth/v2/authorize?client_id=ABC123&redirect_uri=http://localhost:4000/auth&response_type=code"
}
```

### 7-3. 매장 주인 계정으로 승인

1. **반환된 URL**을 브라우저에 붙여넣기
2. **Clover Merchant Account**로 로그인
   - 이메일/비밀번호: 매장 주인의 계정
   - **주의**: Developer 계정 아님!
3. 앱 권한 승인 화면:
   ```
   Forestea would like to:
   - Read merchant information
   - Read inventory
   - Create orders
   - Process payments
   
   [Allow] [Deny]
   ```
4. **"Allow"** 클릭
5. 자동으로 `http://localhost:4000/auth?code=xxxxx`로 리다이렉트

### 7-4. 자동 처리

API 서버가 자동으로:
1. `code`를 받아서 `access_token` 발급 요청
2. Clover로부터 받은 토큰을 DB에 저장 (`clover_auth` 테이블)
3. Merchant ID 저장

### 7-5. Merchant ID 확인

```bash
# PostgreSQL 접속
psql postgresql://forestea:forestea@localhost:5432/forestea

# Merchant ID 조회
SELECT merchant_id, created_at FROM clover_auth;
```

출력 예시:
```
   merchant_id    |         created_at         
------------------+---------------------------
 M9MMNPP2ERA71   | 2026-08-08 12:34:56.789
```

### 7-6. `.env.prod` 업데이트

복사한 Merchant ID를 추가:

```bash
CLOVER_MERCHANT_ID="M9MMNPP2ERA71"
```

서버 재시작:
```bash
# Ctrl+C로 중지 후
pnpm dev-production
```

---

## STEP 8: 테스트

### 8-1. 메뉴 가져오기

```bash
curl http://localhost:4000/menu/categories
```

성공하면 실제 매장의 메뉴 카테고리가 반환됩니다!

### 8-2. Web App 연결

`apps/web/.env.local`:
```bash
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

Web 서버 시작:
```bash
cd /Users/qbnv68/Developer/forestea
pnpm dev
```

브라우저: http://localhost:3000/menu

---

## 📊 각 값의 역할 요약

| 값 | 어디서 | 역할 | 예시 |
|----|--------|------|------|
| **APP_ID** | Developer → App → REST Config | 앱 식별 (Public) | `ABC123XYZ` |
| **APP_SECRET** | Developer → App → REST Config | 앱 인증 (Secret) | `xxxx-xxxx-xxxx` |
| **REDIRECT_URI** | 직접 설정 | OAuth callback URL | `http://localhost:4000/auth` |
| **PAKMS** | Developer → App → Ecommerce Config | 카드 토큰화 (Public) | `dacd407379...` |
| **MERCHANT_ID** | OAuth 완료 후 DB | 매장 식별 | `M9MMNPP2ERA71` |
| **ACCESS_TOKEN** | OAuth 자동 발급 → DB 저장 | API 호출 인증 | 자동 관리됨 |
| **SANDBOX** | 직접 설정 | 환경 선택 | `"false"` = Production |

---

## 🔐 보안 주의사항

### Public (노출 가능)
- `APP_ID` ✅
- `PAKMS` (CLOVER_ECOMMERCE_API_KEY) ✅
- `MERCHANT_ID` ✅

### Secret (절대 노출 금지)
- `APP_SECRET` ❌
- `ACCESS_TOKEN` ❌
- `INTERNAL_API_SECRET` ❌

**`.env.prod` 파일은 절대 git에 커밋하지 마세요!**

---

## 🆚 Sandbox vs Production 비교

| 항목 | Sandbox | Production |
|------|---------|------------|
| **앱 생성** | Developer Dashboard → Sandbox 선택 | Developer Dashboard → Production 선택 |
| **매장 계정** | Test Merchant (무료) | 실제 매장 계정 필요 |
| **결제** | 가짜 카드 번호 | 실제 결제 처리 |
| **데이터** | 테스트 데이터 | 실제 매장 데이터 |
| **API URL** | `apisandbox.dev.clover.com` | `api.clover.com` |
| **OAuth URL** | `sandbox.dev.clover.com` | `www.clover.com` |
| **환경변수** | `CLOVER_SANDBOX="true"` | `CLOVER_SANDBOX="false"` |

---

## 🐛 자주 발생하는 오류

### 1. `redirect_uri_mismatch`
```
Error: redirect_uri in request does not match registered URIs
```

**원인**: Redirect URI가 정확히 일치하지 않음

**해결**:
- Developer Dashboard → REST Configuration 확인
- `.env.prod`의 `CLOVER_REDIRECT_URI` 확인
- 슬래시, 프로토콜(http/https) 정확히 일치시키기

### 2. `Invalid client credentials`
```
Error: Invalid client_id or client_secret
```

**원인**: App ID 또는 App Secret이 틀림

**해결**:
- Developer Dashboard → REST Configuration에서 다시 복사
- 공백이나 따옴표가 섞이지 않았는지 확인

### 3. `401 Unauthorized` (API 호출 시)
```
Error: Unauthorized
```

**원인**: Access Token이 만료되었거나 없음

**해결**:
```sql
-- DB에서 토큰 만료 확인
SELECT * FROM clover_auth;

-- 토큰 만료 시 OAuth 다시 진행
```

### 4. Payment 오류
```
Error: Invalid PAKMS key
```

**원인**: PAKMS Token이 틀리거나 만료됨

**해결**:
- Developer Dashboard → Ecommerce Configuration
- 새 PAKMS 생성 후 `.env.prod` 업데이트

---

## ✅ 완료 체크리스트

설정이 완료되었는지 확인:

- [ ] Developer Account 생성
- [ ] Production App 생성
- [ ] REST Configuration 설정
  - [ ] Site URL
  - [ ] Redirect URI
- [ ] Permissions 설정
- [ ] PAKMS Token 발급
- [ ] `.env.prod` 파일 작성
- [ ] `CLOVER_SANDBOX="false"` 확인
- [ ] Production 서버 실행 (`pnpm dev-production`)
- [ ] OAuth Authorization URL 생성
- [ ] 매장 주인 계정으로 승인
- [ ] Merchant ID DB에 저장됨
- [ ] `.env.prod`에 Merchant ID 추가
- [ ] 메뉴 API 테스트 성공
- [ ] Web App에서 실제 메뉴 조회 성공

---

## 🚀 다음 단계: 배포

로컬에서 테스트가 완료되면:

1. **도메인 준비**
   - API: `api.your-domain.com`
   - Web: `your-domain.com`

2. **Clover Developer Dashboard 업데이트**
   - Site URL: `https://api.your-domain.com`
   - Redirect URI: `https://api.your-domain.com/auth`

3. **Production 환경변수 설정**
   ```bash
   CLOVER_REDIRECT_URI="https://api.your-domain.com/auth"
   WEB_ORIGIN="https://your-domain.com"
   ```

4. **HTTPS 필수!**
   - Production에서는 HTTP 사용 불가
   - SSL 인증서 필요 (Let's Encrypt 무료)

---

## 📞 도움 받기

문제가 생기면:

1. **Clover Developer Support**
   - https://community.clover.com/
   - developer-relations@clover.com

2. **프로젝트 로그 확인**
   ```bash
   # API 서버 로그
   cd apps/api
   pnpm dev-production
   
   # PostgreSQL 로그
   psql postgresql://forestea:forestea@localhost:5432/forestea
   SELECT * FROM clover_auth;
   ```

3. **Clover API Explorer**
   - https://docs.clover.com/reference
   - Access Token 넣어서 수동 테스트 가능

---

**이제 준비 완료! 🎉**
