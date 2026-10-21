import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import cookieParser from 'cookie-parser';
import express from 'express';

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.JWT_ACCESS_SECRET =
  'test-access-secret-that-is-at-least-32-characters';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-that-is-at-least-32-characters';
process.env.OAUTH_STATE_SECRET =
  'test-oauth-secret-that-is-at-least-32-characters';
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.API_BASE_URL = 'http://localhost:5001';
process.env.CLIENT_BASE_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
process.env.KAKAO_CLIENT_ID = 'kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'kakao-client-secret';
process.env.NAVER_CLIENT_ID = 'naver-client-id';
process.env.NAVER_CLIENT_SECRET = 'naver-client-secret';

const [{ SocialAuthController }, { CookieProvider }, { OAuthStateProvider }] =
  await Promise.all([
    import('../src/controllers/auth/social.controller.js'),
    import('../src/providers/cookie.provider.js'),
    import('../src/providers/oauth-state.provider.js'),
  ]);

let server;
let baseUrl;

const toCookieHeader = (setCookies) =>
  setCookies.map((value) => value.split(';', 1)[0]).join('; ');

const beginLogin = async (provider = 'google') => {
  const response = await fetch(
    `${baseUrl}/api/auth/social/${provider}/login?next=/dashboard`,
    { redirect: 'manual' },
  );
  const location = new URL(response.headers.get('location'));
  return {
    response,
    location,
    state: location.searchParams.get('state'),
    cookieHeader: toCookieHeader(response.headers.getSetCookie()),
  };
};

before(() => {
  const cookieProvider = new CookieProvider();
  const controller = new SocialAuthController({
    socialAuthService: {
      loginOrSignUp: async () => ({
        tokens: { accessToken: 'access', refreshToken: 'refresh' },
      }),
    },
    cookieProvider,
    oauthStateProvider: new OAuthStateProvider({
      oauthStateSecret: process.env.OAUTH_STATE_SECRET,
      clientBaseUrl: process.env.CLIENT_BASE_URL,
    }),
  });
  const app = express();
  app.use(cookieParser());
  app.use('/api/auth', controller.routes());
  app.use((error, req, res, _next) => {
    res.status(error.statusCode ?? 500).json({ message: error.message });
  });
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

test('builds all provider redirects with state and PKCE S256', async () => {
  for (const provider of ['google', 'kakao', 'naver']) {
    const { response, location, state } = await beginLogin(provider);
    assert.equal(response.status, 302);
    assert.ok(state);
    assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
    assert.equal(location.searchParams.get('code_challenge')?.length, 43);

    const setCookies = response.headers.getSetCookie();
    assert.equal(setCookies.length, 2);
    for (const cookie of setCookies) {
      assert.match(cookie, /HttpOnly/i);
      assert.match(cookie, /SameSite=Lax/i);
      assert.match(cookie, /Path=\/api\/auth\/social\/callback/i);
    }
    assert.match(setCookies[0], /^oauthTransactionNonce=/);
    assert.match(setCookies[1], /^oauthCodeVerifier=/);
  }
});

test('accepts one browser callback and rejects reuse after transaction cookies are cleared', async () => {
  const { state, cookieHeader } = await beginLogin();
  const callbackUrl = `${baseUrl}/api/auth/social/callback/google?code=code&state=${encodeURIComponent(state)}`;
  const success = await fetch(callbackUrl, {
    headers: { Cookie: cookieHeader },
    redirect: 'manual',
  });

  assert.equal(success.status, 302);
  assert.equal(
    success.headers.get('location'),
    'http://localhost:3000/dashboard',
  );
  const successCookies = success.headers.getSetCookie();
  assert.ok(
    successCookies.some((value) => /^oauthTransactionNonce=;/.test(value)),
  );
  assert.ok(successCookies.some((value) => /^oauthCodeVerifier=;/.test(value)));
  assert.ok(successCookies.some((value) => /^accessToken=/.test(value)));
  assert.ok(successCookies.some((value) => /^refreshToken=/.test(value)));

  const reusedWithoutCookies = await fetch(callbackUrl, { redirect: 'manual' });
  assert.equal(reusedWithoutCookies.status, 400);
});

test('clears transaction cookies on cancellation, invalid state, and missing input', async () => {
  const cases = [
    ({ state }) => `?error=access_denied&state=${encodeURIComponent(state)}`,
    ({ state }) => `?code=code&state=${encodeURIComponent(`${state}tampered`)}`,
    () => '?code=code',
    ({ state }) => `?state=${encodeURIComponent(state)}`,
  ];

  for (const buildQuery of cases) {
    const login = await beginLogin();
    const response = await fetch(
      `${baseUrl}/api/auth/social/callback/google${buildQuery(login)}`,
      {
        headers: { Cookie: login.cookieHeader },
        redirect: 'manual',
      },
    );
    assert.ok([400, 401].includes(response.status));
    const setCookies = response.headers.getSetCookie();
    assert.ok(
      setCookies.some((value) => /^oauthTransactionNonce=;/.test(value)),
    );
    assert.ok(setCookies.some((value) => /^oauthCodeVerifier=;/.test(value)));
  }
});
