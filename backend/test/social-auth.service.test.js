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

test('does not automatically connect a social login to an existing email account', async () => {
  const responses = [
    jsonResponse({ access_token: 'google-access-token' }),
    jsonResponse({
      sub: 'google-user-id',
      email: 'Student@Example.com',
      email_verified: true,
      name: 'Student',
    }),
  ];
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  };

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

  try {
    await assert.rejects(
      service.loginOrSignUp({
        provider: 'google',
        code: 'code',
        state: 'state',
        codeVerifier: 'google-code-verifier',
      }),
      {
        message:
          'Sign in with your existing account before connecting this social account',
      },
    );
    assert.equal(
      requests[0].options.body.get('code_verifier'),
      'google-code-verifier',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('does not use a mutable Naver contact email as an account-link identity', async () => {
  const responses = [
    jsonResponse({ access_token: 'naver-access-token' }),
    jsonResponse({
      response: {
        id: 'naver-user-id',
        email: 'contact@example.com',
        name: 'Student',
      },
    }),
  ];
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  };
  let createdUser = null;

  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: async () => null,
      findByEmail: () =>
        assert.fail('unverified contact email must not be queried'),
      createWithSocialAccount: async (input) => {
        createdUser = input;
        return { id: 2, email: input.email, name: input.name };
      },
    },
    tokenProvider: {
      generateTokens: () => ({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    },
  });

  try {
    await service.loginOrSignUp({
      provider: 'naver',
      code: 'code',
      state: 'state',
      codeVerifier: 'naver-code-verifier',
    });
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
  } finally {
    globalThis.fetch = originalFetch;
  }

  const expectedDigest = createHash('sha256')
    .update('naver:naver-user-id')
    .digest('base64url');
  assert.equal(createdUser.email, `naver_${expectedDigest}@social.local`);
});

test('keeps different BASE64-shaped Naver IDs distinct in virtual emails', async () => {
  const responses = [
    jsonResponse({ access_token: 'first-token' }),
    jsonResponse({ response: { id: 'a+b', name: 'First' } }),
    jsonResponse({ access_token: 'second-token' }),
    jsonResponse({ response: { id: 'a/b', name: 'Second' } }),
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => responses.shift();
  const createdEmails = [];

  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: async () => null,
      findByEmail: () => assert.fail('Naver contact email must not be queried'),
      createWithSocialAccount: async (input) => {
        createdEmails.push(input.email);
        return { id: createdEmails.length, ...input };
      },
    },
    tokenProvider: {
      generateTokens: () => ({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    },
  });

  try {
    for (const code of ['first-code', 'second-code']) {
      await service.loginOrSignUp({
        provider: 'naver',
        code,
        state: 'state',
        codeVerifier: 'naver-code-verifier',
      });
    }
  } finally {
    globalThis.fetch = originalFetch;
  }

  assert.equal(createdEmails.length, 2);
  assert.notEqual(createdEmails[0], createdEmails[1]);
  for (const email of createdEmails) {
    assert.ok(email.indexOf('@') <= 64);
  }
});

test('sends the Kakao PKCE verifier in the token request body', async () => {
  const responses = [
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
  ];
  const requests = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url, options = {}) => {
    requests.push({ url, options });
    return responses.shift();
  };

  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: async () => null,
      findByEmail: async () => null,
      createWithSocialAccount: async (input) => ({ id: 3, ...input }),
    },
    tokenProvider: {
      generateTokens: () => ({
        accessToken: 'access',
        refreshToken: 'refresh',
      }),
    },
  });

  try {
    await service.loginOrSignUp({
      provider: 'kakao',
      code: 'code',
      state: 'state',
      codeVerifier: 'kakao-code-verifier',
    });
    assert.equal(
      requests[0].options.body.get('code_verifier'),
      'kakao-code-verifier',
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects a provider token response without an access token', async () => {
  const responses = [
    jsonResponse({}),
    jsonResponse({
      sub: 'google-user-id',
      email: 'student@example.com',
      email_verified: true,
    }),
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => responses.shift();
  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: () =>
        assert.fail('an invalid token response must stop before user lookup'),
    },
    tokenProvider: {
      generateTokens: () => assert.fail('tokens must not be generated'),
    },
  });

  try {
    await assert.rejects(
      service.loginOrSignUp({
        provider: 'google',
        code: 'code',
        state: 'state',
        codeVerifier: 'google-code-verifier',
      }),
      { message: 'Social authentication failed' },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects a provider profile without its required user ID', async () => {
  const responses = [
    jsonResponse({ access_token: 'google-access-token' }),
    jsonResponse({
      email: 'student@example.com',
      email_verified: true,
    }),
  ];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => responses.shift();
  const service = new SocialAuthService({
    userRepository: {
      findBySocialAccount: () =>
        assert.fail('an invalid profile must stop before user lookup'),
    },
    tokenProvider: {
      generateTokens: () => assert.fail('tokens must not be generated'),
    },
  });

  try {
    await assert.rejects(
      service.loginOrSignUp({
        provider: 'google',
        code: 'code',
        state: 'state',
        codeVerifier: 'google-code-verifier',
      }),
      { message: 'Social authentication failed' },
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('rejects missing identity fields from every provider profile', async () => {
  const cases = [
    ['google', {}],
    ['kakao', {}],
    ['naver', { response: {} }],
  ];

  for (const [provider, profilePayload] of cases) {
    const responses = [
      jsonResponse({ access_token: `${provider}-access-token` }),
      jsonResponse(profilePayload),
    ];
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => responses.shift();
    const service = new SocialAuthService({
      userRepository: {
        findBySocialAccount: () =>
          assert.fail('an invalid profile must stop before user lookup'),
      },
      tokenProvider: {
        generateTokens: () => assert.fail('tokens must not be generated'),
      },
    });

    try {
      await assert.rejects(
        service.loginOrSignUp({
          provider,
          code: 'code',
          state: 'state',
          codeVerifier: `${provider}-code-verifier`,
        }),
        { message: 'Social authentication failed' },
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }
});
