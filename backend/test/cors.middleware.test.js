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
process.env.CORS_ORIGINS = 'http://localhost:3000';
process.env.API_BASE_URL = 'http://localhost:5001';
process.env.CLIENT_BASE_URL = 'http://localhost:3000';
process.env.GOOGLE_CLIENT_ID = 'google-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'google-client-secret';
process.env.KAKAO_CLIENT_ID = 'kakao-client-id';
process.env.KAKAO_CLIENT_SECRET = 'kakao-client-secret';
process.env.NAVER_CLIENT_ID = 'naver-client-id';
process.env.NAVER_CLIENT_SECRET = 'naver-client-secret';

const { cors } = await import('../src/middlewares/cors.middleware.js');

const invokeCors = (origin) => {
  const headers = new Map();
  const variedHeaders = [];
  let nextCalled = false;
  const req = { headers: { origin }, method: 'GET' };
  const res = {
    header: (name, value) => headers.set(name, value),
    vary: (name) => variedHeaders.push(name),
  };

  cors(req, res, () => {
    nextCalled = true;
  });

  return { headers, variedHeaders, nextCalled };
};

test('allows credentials only for an explicitly configured CORS origin', () => {
  const allowed = invokeCors('http://localhost:3000');
  assert.equal(
    allowed.headers.get('Access-Control-Allow-Origin'),
    'http://localhost:3000',
  );
  assert.equal(allowed.headers.get('Access-Control-Allow-Credentials'), 'true');
  assert.deepEqual(allowed.variedHeaders, ['Origin']);
  assert.equal(allowed.nextCalled, true);

  const rejected = invokeCors('http://localhost:4000');
  assert.equal(rejected.headers.has('Access-Control-Allow-Origin'), false);
  assert.equal(rejected.headers.has('Access-Control-Allow-Credentials'), false);
  assert.deepEqual(rejected.variedHeaders, ['Origin']);
  assert.equal(rejected.nextCalled, true);
});
