# Social OAuth Starter

이 프로젝트는 Google, Kakao, Naver의 Authorization Code Flow를 Passport 없이
직접 연결한 수업용 시작본입니다. 프론트엔드는 로그인 버튼과 로그인 상태를,
백엔드는 공급자 리디렉션·인가 코드 교환·프로필 정규화·서비스 JWT 발급을
담당합니다.

## 처음 확인할 상태

- `.nvmrc`에 고정된 Node.js 26.7.0을 사용합니다.
- `frontend`는 `http://localhost:3000`에서 실행합니다.
- `backend`는 `http://localhost:5001`에서 실행합니다.
- OAuth 앱과 로컬 환경 변수를 설정하기 전에는 공급자 로그인이 성공하지
  않습니다.
- Google, Kakao, Naver의 실제 자격 증명은 저장소에 포함하지 않습니다.

## 프로젝트 구조

```text
codeit-fs-social-oauth-starter/
├── frontend/
├── backend/
└── SOCIAL_LOGIN_FLOWS.md
```

학생은 제공된 OAuth 구현의 흐름을 읽고, 세 공급자의 개발자 콘솔에서 로컬 앱을
설정한 뒤 자신의 `backend/env/.env.development`에 자격 증명을 입력합니다.
소스 코드에 secret을 붙여 넣거나 화면을 캡처해 공유하지 않습니다.

Google과 Naver 요청에는 공급자 계약에 따라 `openid` scope가 포함되지만, 이
프로젝트는 ID Token을 인증 결과로 검증하지 않습니다. 공급자 access token으로
공식 사용자 정보 API를 호출하며, 코드의 `transactionNonce`는 OIDC `nonce`가
아니라 현재 브라우저의 OAuth 로그인 요청을 callback에 결합하는 내부 값입니다.

## 설치

```bash
nvm use
```

```bash
cd frontend
pnpm install

cd ../backend
pnpm install
```

## 백엔드 환경 변수

```bash
cp env/.env.example env/.env.development
```

`env/.env.development`의 `<database-user>`와 `<database-password>`, JWT secret,
OAuth `Client ID`·`Client Secret`을 로컬 값으로 교체합니다.
`OAUTH_STATE_SECRET`은 JWT secret과 다른 32자 이상의 난수 문자열을 사용합니다.

## 데이터베이스와 실행

`DATABASE_URL`은 이미 생성된 로컬 PostgreSQL 데이터베이스를 가리켜야 합니다.
두 터미널을 각각 프로젝트 루트에서 열어 다음 명령을 실행합니다.

```bash
cd backend
pnpm run prisma:generate
pnpm run prisma:push
pnpm run dev
```

다른 터미널에서 프론트엔드를 실행합니다.

```bash
cd frontend
cp .env.example .env.local
pnpm run dev
```

## 보안 경계

- `state`는 요청마다 새 난수를 사용하고 서명·만료 시간·공급자·브라우저 쿠키를
  함께 검증합니다.
- 세 공급자 모두 PKCE S256 challenge를 인가 요청에 보내고, HttpOnly 쿠키에
  결합한 verifier를 토큰 요청 body에서 한 번 사용합니다.
- OAuth transaction cookie는 `SameSite=Lax`와 callback 전용 경로를 사용하고,
  운영 HTTPS에서는 `Secure`도 사용합니다. 인증 API의 credentialed CORS 응답은
  `CORS_ORIGINS`에 등록한 정확한 origin에만 허용합니다.
- 로그인 후 이동 경로는 프론트엔드와 같은 origin의 상대 경로만 허용합니다.
- 공급자 access token과 필수 사용자 ID가 없는 응답은 사용자 조회 전에
  거부합니다.
- 기존 이메일 계정에 소셜 계정을 자동 연결하지 않습니다. 기존 계정에 연결하는
  기능은 기존 계정으로 인증한 상태에서 별도로 구현해야 합니다.
- 일반 가입과 공급자가 검증한 이메일은 같은 소문자 형식으로 저장·조회합니다.
- Naver 연락처 이메일과 검증되지 않은 공급자 이메일은 계정 연결 식별자로
  사용하지 않습니다.
- 소셜 로그인 버튼은 흐름 검증용 중립 텍스트 컨트롤입니다. 실제 서비스에서는
  각 공급자의 공식 브랜드 asset과 규격을 별도로 적용합니다.

상세 요청 순서와 파일 매핑은 [SOCIAL_LOGIN_FLOWS.md](./SOCIAL_LOGIN_FLOWS.md)를
참고합니다.
