# Social OAuth Backend

Express, Prisma, Awilix로 구성한 소셜 로그인 API입니다. Google, Kakao, Naver의
Authorization Code Flow를 직접 처리하고 로그인 성공 후 서비스 JWT를 HttpOnly
쿠키로 전달합니다.

## 준비

- Node.js 24.18.1
- pnpm
- PostgreSQL

```bash
pnpm install
cp env/.env.example env/.env.development
```

`env/.env.development`의 `<database-user>`와 `<database-password>`를 포함한 예시
값을 로컬 환경에 맞게 교체합니다. 실제 OAuth secret과 JWT secret은 Git에
추가하지 않습니다.

## 데이터베이스

```bash
pnpm run prisma:generate
pnpm run prisma:push
```

초기 데이터가 필요할 때만 seed를 실행합니다.

```bash
pnpm run seed
```

## 실행과 검사

```bash
pnpm run dev
```

```bash
pnpm run format:check
pnpm run lint
pnpm run test
```

기본 API 주소는 `http://localhost:5001/api`입니다.

## 주요 파일

- `src/controllers/auth/social.controller.js`: 인가 요청과 callback
- `src/providers/oauth-state.provider.js`: state와 PKCE 생성·검증
- `src/services/social-auth.service.js`: 공급자 토큰·프로필 요청
- `src/providers/cookie.provider.js`: state nonce·PKCE verifier와 인증 쿠키
- `src/providers/token.provider.js`: 서비스 JWT
