# Social OAuth Frontend

Google, Kakao, Naver OAuth 흐름용 중립 텍스트 버튼과 로그인 상태를 확인하는 Next.js
프론트엔드입니다.

## 준비와 실행

```bash
pnpm install
cp .env.example .env.local
pnpm run dev
```

기본 화면은 `http://localhost:3000`에서 확인합니다. 백엔드는 기본적으로
`http://localhost:5001`에서 실행해야 합니다.

## 검사

```bash
pnpm run lint
pnpm run build
```
