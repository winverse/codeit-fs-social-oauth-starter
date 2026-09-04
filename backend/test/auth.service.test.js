import assert from 'node:assert/strict';
import test from 'node:test';

import { AuthService } from '../src/services/auth.service.js';

const tokenProvider = {
  generateTokens: () => ({ accessToken: 'access', refreshToken: 'refresh' }),
};

test('uses the same lowercase email form for sign-up and login', async () => {
  const queriedEmails = [];
  let createdEmail = null;
  const service = new AuthService({
    userRepository: {
      findByEmail: async (email, options) => {
        queriedEmails.push({ email, options });
        return options?.includePassword
          ? { id: 1, email, password: 'hashed-password' }
          : null;
      },
      create: async (input) => {
        createdEmail = input.email;
        return { id: 1, ...input };
      },
      findById: async () => ({
        id: 1,
        email: 'student@example.com',
        name: 'Student',
      }),
    },
    passwordProvider: {
      hash: async () => 'hashed-password',
      compare: async () => true,
    },
    tokenProvider,
  });

  await service.signUp({
    email: 'Student@Example.com',
    password: 'password',
    name: 'Student',
  });
  await service.login({
    email: 'STUDENT@EXAMPLE.COM',
    password: 'password',
  });

  assert.equal(createdEmail, 'student@example.com');
  assert.deepEqual(
    queriedEmails.map(({ email }) => email),
    ['student@example.com', 'student@example.com'],
  );
});
