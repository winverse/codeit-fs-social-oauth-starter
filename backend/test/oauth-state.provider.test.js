import assert from 'node:assert/strict';
import test from 'node:test';
import { OAuthStateProvider } from '../src/providers/oauth-state.provider.js';

const NOW = 1_800_000_000_000;
const createProvider = ({ now = NOW } = {}) =>
  new OAuthStateProvider(
    {
      oauthStateSecret: 'test-secret-that-is-longer-than-32-characters',
      clientBaseUrl: 'http://localhost:3000',
    },
    {
      now: () => now,
      randomBytesFn: () => Buffer.alloc(32, 1),
    },
  );

test('accepts state bound to the provider, browser nonce, and PKCE verifier', () => {
  const provider = createProvider();
  const { state, nonce, codeVerifier, codeChallenge } = provider.createState({
    provider: 'google',
    next: '/products?sort=latest#list',
  });

  assert.equal(codeVerifier.length, 43);
  assert.equal(codeChallenge.length, 43);
  assert.deepEqual(
    provider.verifyState({
      state,
      provider: 'google',
      nonce,
      codeVerifier,
    }),
    {
      provider: 'google',
      next: '/products?sort=latest#list',
    },
  );
});

test('rejects tampered state, nonce, verifier, and provider values', () => {
  const provider = createProvider();
  const { state, nonce, codeVerifier } = provider.createState({
    provider: 'google',
    next: '/',
  });

  assert.equal(
    provider.verifyState({
      state: `${state}tampered`,
      provider: 'google',
      nonce,
      codeVerifier,
    }),
    null,
  );
  assert.equal(
    provider.verifyState({
      state,
      provider: 'google',
      nonce: 'other',
      codeVerifier,
    }),
    null,
  );
  assert.equal(
    provider.verifyState({
      state,
      provider: 'google',
      nonce,
      codeVerifier: 'different-code-verifier',
    }),
    null,
  );
  assert.equal(
    provider.verifyState({
      state,
      provider: 'kakao',
      nonce,
      codeVerifier,
    }),
    null,
  );
});

test('rejects an expired state', () => {
  const issuingProvider = createProvider();
  const { state, nonce, codeVerifier } = issuingProvider.createState({
    provider: 'naver',
    next: '/',
  });
  const verifyingProvider = createProvider({ now: NOW + 10 * 60 * 1000 + 1 });

  assert.equal(
    verifyingProvider.verifyState({
      state,
      provider: 'naver',
      nonce,
      codeVerifier,
    }),
    null,
  );
});

test('normalizes unsafe redirect targets to the application root', () => {
  const provider = createProvider();

  assert.equal(provider.normalizeNextPath('https://evil.example'), '/');
  assert.equal(provider.normalizeNextPath('//evil.example'), '/');
  assert.equal(provider.normalizeNextPath('/\\evil.example'), '/');
  assert.equal(provider.normalizeNextPath('/dashboard'), '/dashboard');
});
