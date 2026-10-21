import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import test from 'node:test';

process.env.NODE_ENV = 'test';
process.env.PORT = '5001';
process.env.DATABASE_URL = 'postgresql://localhost:5432/test';
process.env.JWT_ACCESS_SECRET =
  'test-access-secret-that-is-at-least-32-characters';
process.env.JWT_REFRESH_SECRET =
  'test-refresh-secret-that-is-at-least-32-characters';
process.env.OAUTH_STATE_SECRET =
  'test-oauth-secret-that-is-at-least-32-characters';
process.env.API_BASE_URL = 'http://localhost:5001';
process.env.CLIENT_BASE_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
process.env.KAKAO_CLIENT_ID = 'kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'kakao-client-secret';
process.env.NAVER_CLIENT_ID = 'naver-client-id';
process.env.NAVER_CLIENT_SECRET = 'naver-client-secret';

const { SocialAuthService } =
  await import('../src/services/social-auth.service.js');

const jsonResponse = (payload) => ({
  ok: true,
  statusText: 'OK',
  text: async () => JSON.stringify(payload),
});

const withFakeFetch = async (responses, run) => {
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  };

  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
  return requests;
};

const createService = (userRepository = {}) =>
  new SocialAuthService({
    userRepository,
    tokenProvider: {
      generateTokens: () => ({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    },
  });

const naverProfileResponses = (id, email) => [
  jsonResponse({ access_token: 'naver-access-token' }),
  jsonResponse({ response: { id, email, name: 'Student' } }),
];

test('getSocialProfile sends the Google PKCE verifier in the token request', async () => {
  const requests = await withFakeFetch(
    [
      jsonResponse({ access_token: 'google-access-token' }),
      jsonResponse({
        sub: 'google-user-id',
        email: 'Student@Example.com',
        email_verified: true,
        name: 'Student',
      }),
    ],
    async () => {
      const profile = await createService().getSocialProfile('google', {
        code: 'code',
        state: 'state',
        codeVerifier: 'google-code-verifier',
      });
      assert.deepEqual(profile, {
        id: 'google-user-id',
        email: 'Student@Example.com',
        emailVerified: true,
        name: 'Student',
      });
    },
  );

  assert.equal(
    requests[0].options.body.get('code_verifier'),
    'google-code-verifier',
  );
});

test('getSocialProfile sends the same redirect_uri as getCallbackUri in every token request', async () => {
  const profilePayloads = {
    google: { sub: 'google-user-id' },
    kakao: { id: 123 },
    naver: { response: { id: 'naver-user-id' } },
  };

  for (const [provider, profilePayload] of Object.entries(profilePayloads)) {
    const requests = await withFakeFetch(
      [
        jsonResponse({ access_token: `${provider}-access-token` }),
        jsonResponse(profilePayload),
      ],
      () =>
        createService().getSocialProfile(provider, {
          code: 'code',
          state: 'state',
          codeVerifier: `${provider}-code-verifier`,
        }),
    );

    assert.equal(
      requests[0].options.body.get('redirect_uri'),
      SocialAuthService.getCallbackUri(provider),
    );
  }
});

test('getSocialProfile sends the Kakao PKCE verifier and requests the profile with GET', async () => {
  const requests = await withFakeFetch(
    [
      jsonResponse({ access_token: 'kakao-access-token' }),
      jsonResponse({
        id: 123,
        kakao_account: {
          email: 'kakao@example.com',
          is_email_valid: true,
          is_email_verified: true,
          profile: { nickname: 'Student' },
        },
      }),
    ],
    () =>
      createService().getSocialProfile('kakao', {
        code: 'code',
        state: 'state',
        codeVerifier: 'kakao-code-verifier',
      }),
  );

  assert.equal(
    requests[0].options.body.get('code_verifier'),
    'kakao-code-verifier',
  );
  assert.equal(requests[1].url, 'https://kapi.kakao.com/v2/user/me');
  assert.equal(requests[1].options.method ?? 'GET', 'GET');
  assert.equal(requests[1].options.body, undefined);
  assert.equal(
    requests[1].options.headers.Authorization,
    'Bearer kakao-access-token',
  );
});

test('getSocialProfile sends the Naver token request and marks its email unverified', async () => {
  let profile;
  const requests = await withFakeFetch(
    naverProfileResponses('naver-user-id', 'contact@example.com'),
    async () => {
      profile = await createService().getSocialProfile('naver', {
        code: 'code',
        state: 'state',
        codeVerifier: 'naver-code-verifier',
      });
    },
  );

  assert.equal(requests[0].url, 'https://nid.naver.com/oauth2/token');
  assert.equal(requests[0].options.method, 'POST');
  assert.equal(
    requests[0].options.body.get('code_verifier'),
    'naver-code-verifier',
  );
  assert.equal(
    requests[0].options.body.get('client_secret'),
    'naver-client-secret',
  );
  assert.equal(new URL(requests[0].url).search, '');
  assert.equal(profile.emailVerified, false);
});

test('getSocialProfile rejects a provider token response without an access token', async () => {
  await withFakeFetch(
    [
      jsonResponse({}),
      jsonResponse({
        sub: 'google-user-id',
        email: 'student@example.com',
        email_verified: true,
      }),
    ],
    () =>
      assert.rejects(
        createService().getSocialProfile('google', {
          code: 'code',
          state: 'state',
          codeVerifier: 'google-code-verifier',
        }),
        { message: '소셜 로그인에 실패했습니다.' },
      ),
  );
});

test('getSocialProfile rejects a provider profile without its required user ID', async () => {
  await withFakeFetch(
    [
      jsonResponse({ access_token: 'google-access-token' }),
      jsonResponse({
        email: 'student@example.com',
        email_verified: true,
      }),
    ],
    () =>
      assert.rejects(
        createService().getSocialProfile('google', {
          code: 'code',
          state: 'state',
          codeVerifier: 'google-code-verifier',
        }),
        { message: '소셜 로그인에 실패했습니다.' },
      ),
  );
});

test('getSocialProfile rejects missing identity fields from every provider profile', async () => {
  const cases = [
    ['google', {}],
    ['kakao', {}],
    ['naver', { response: {} }],
  ];

  for (const [provider, profilePayload] of cases) {
    await withFakeFetch(
      [
        jsonResponse({ access_token: `${provider}-access-token` }),
        jsonResponse(profilePayload),
      ],
      () =>
        assert.rejects(
          createService().getSocialProfile(provider, {
            code: 'code',
            state: 'state',
            codeVerifier: `${provider}-code-verifier`,
          }),
          { message: '소셜 로그인에 실패했습니다.' },
        ),
    );
  }
});

test('loginOrSignUp does not automatically connect a social login to an existing email account', async () => {
  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: async () => null,
      findByEmail: async (email) => {
        assert.equal(email, 'student@example.com');
        return { id: 1, email };
      },
    },
    tokenProvider: {
      generateTokens: () => assert.fail('tokens must not be generated'),
    },
  });

  await assert.rejects(
    service.loginOrSignUp({
      provider: 'google',
      profile: {
        id: 'google-user-id',
        email: 'Student@Example.com',
        emailVerified: true,
        name: 'Student',
      },
    }),
    {
      message:
        '이 소셜 계정을 연결하려면 먼저 기존 계정으로 로그인해야 합니다.',
    },
  );
});

test('loginOrSignUp does not use a mutable Naver contact email as an account-link identity', async () => {
  let createdUser = null;
  const service = createService({
    findBySocialAccount: async () => null,
    findByEmail: () =>
      assert.fail('unverified contact email must not be queried'),
    createWithSocialAccount: async (input) => {
      createdUser = input;
      return { id: 2, email: input.email, name: input.name };
    },
  });

  await withFakeFetch(
    naverProfileResponses('naver-user-id', 'contact@example.com'),
    async () => {
      const profile = await service.getSocialProfile('naver', {
        code: 'code',
        state: 'state',
        codeVerifier: 'naver-code-verifier',
      });
      await service.loginOrSignUp({ provider: 'naver', profile });
    },
  );

  const expectedDigest = createHash('sha256')
    .update('naver:naver-user-id')
    .digest('base64url');
  assert.equal(createdUser.email, `naver_${expectedDigest}@social.local`);
});

test('loginOrSignUp keeps different BASE64-shaped Naver IDs distinct in virtual emails', async () => {
  const createdEmails = [];
  const service = createService({
    findBySocialAccount: async () => null,
    findByEmail: () => assert.fail('Naver contact email must not be queried'),
    createWithSocialAccount: async (input) => {
      createdEmails.push(input.email);
      return { id: createdEmails.length, ...input };
    },
  });

  for (const id of ['a+b', 'a/b']) {
    await withFakeFetch(naverProfileResponses(id), async () => {
      const profile = await service.getSocialProfile('naver', {
        code: 'code',
        state: 'state',
        codeVerifier: 'naver-code-verifier',
      });
      await service.loginOrSignUp({ provider: 'naver', profile });
    });
  }

  assert.equal(createdEmails.length, 2);
  assert.notEqual(createdEmails[0], createdEmails[1]);
  for (const email of createdEmails) {
    assert.ok(email.indexOf('@') <= 64);
  }
});
