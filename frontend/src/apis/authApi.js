import { requestApi } from './requestApi';

const withAuthCookies = {
  credentials: 'include',
};

export function signUp(payload) {
  return requestApi('/api/auth/signup', {
    method: 'POST',
    body: payload,
    ...withAuthCookies,
  });
}

export function login(payload) {
  return requestApi('/api/auth/login', {
    method: 'POST',
    body: payload,
    ...withAuthCookies,
  });
}

export function logout() {
  return requestApi('/api/auth/logout', {
    method: 'POST',
    ...withAuthCookies,
  });
}

export function getMe() {
  return requestApi('/api/auth/me', {
    ...withAuthCookies,
  });
}
