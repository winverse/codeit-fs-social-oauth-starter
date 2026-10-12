import { config } from '#config';
import { DAY_IN_MS, MINUTE_IN_MS } from '#constants';

export class CookieProvider {
  setAuthCookies(res, tokens) {
    const { accessToken, refreshToken } = tokens;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * MINUTE_IN_MS,
      path: '/',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * DAY_IN_MS,
      path: '/',
    });
  }

  clearAuthCookies(res) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  setOAuthTransactionCookies(res, { transactionNonce, codeVerifier }) {
    res.cookie('oauthTransactionNonce', transactionNonce, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * MINUTE_IN_MS,
      path: '/api/auth/social/callback',
    });

    res.cookie('oauthCodeVerifier', codeVerifier, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * MINUTE_IN_MS,
      path: '/api/auth/social/callback',
    });
  }

  getOAuthTransactionNonce(req) {
    return req.cookies?.oauthTransactionNonce ?? null;
  }

  getOAuthCodeVerifier(req) {
    return req.cookies?.oauthCodeVerifier ?? null;
  }

  clearOAuthTransactionCookies(res) {
    res.clearCookie('oauthTransactionNonce', {
      path: '/api/auth/social/callback',
    });
    res.clearCookie('oauthCodeVerifier', {
      path: '/api/auth/social/callback',
    });
  }
}
