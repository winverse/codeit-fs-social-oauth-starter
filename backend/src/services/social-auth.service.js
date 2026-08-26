import { createHash } from 'node:crypto';
import { config } from '#config';
import { ERROR_MESSAGE } from '#constants';
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from '#exceptions';

export class SocialAuthService {
  #userRepository;
  #tokenProvider;

  constructor({ userRepository, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#tokenProvider = tokenProvider;
  }

  async loginOrSignUp({ provider, code, state, codeVerifier }) {
    const profile = await this.#getSocialProfile(
      provider,
      code,
      state,
      codeVerifier,
    );
    const user = await this.#resolveUser({ provider, profile });
    const tokens = this.#tokenProvider.generateTokens(user);
    return { user, tokens };
  }

  async #resolveUser({ provider, profile }) {
    const socialUser = await this.#userRepository.findBySocialAccount(
      provider,
      profile.id,
    );

    // 1. 소셜 계정으로 찾은 경우 — 이름 없으면 업데이트
    if (socialUser) {
      return !socialUser.name && profile.name
        ? this.#userRepository.update(socialUser.id, { name: profile.name })
        : socialUser;
    }

    const email = this.#resolveEmail({ provider, profile });
    const existingUser = profile.emailVerified
      ? await this.#userRepository.findByEmail(email)
      : null;

    // 2. 이메일 일치 유저 없으면 새 유저 생성
    if (!existingUser) {
      return this.#userRepository.createWithSocialAccount({
        email,
        name: profile.name,
        provider,
        providerId: profile.id,
      });
    }

    // 3. 기존 계정은 로그인한 상태에서 명시적으로 연결해야 함
    throw new ConflictException(ERROR_MESSAGE.SOCIAL_ACCOUNT_LINK_REQUIRED);
  }

  async #getSocialProfile(provider, code, state, codeVerifier) {
    switch (provider) {
      case 'google':
        return this.#getGoogleProfile(code, codeVerifier);
      case 'kakao':
        return this.#getKakaoProfile(code, codeVerifier);
      case 'naver':
        return this.#getNaverProfile(code, state, codeVerifier);
      default:
        throw new BadRequestException(
          ERROR_MESSAGE.UNSUPPORTED_SOCIAL_PROVIDER,
        );
    }
  }

  async #getGoogleProfile(code, codeVerifier) {
    const callbackUri = `${config.API_BASE_URL}/api/auth/social/callback/google`;

    const tokenResponse = await this.#requestSocialJson(
      'https://oauth2.googleapis.com/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: config.GOOGLE_CLIENT_ID,
          client_secret: config.GOOGLE_CLIENT_SECRET,
          redirect_uri: callbackUri,
          grant_type: 'authorization_code',
          code_verifier: codeVerifier,
        }),
      },
      'Google 토큰 요청에 실패했습니다.',
    );

    const profileResponse = await this.#requestSocialJson(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      },
      'Google 프로필 조회에 실패했습니다.',
    );

    return {
      id: String(profileResponse.sub),
      email: profileResponse.email ?? null,
      emailVerified: profileResponse.email_verified === true,
      name: profileResponse.name ?? 'Google User',
    };
  }

  async #getKakaoProfile(code, codeVerifier) {
    const callbackUri = `${config.API_BASE_URL}/api/auth/social/callback/kakao`;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.KAKAO_CLIENT_ID,
      client_secret: config.KAKAO_CLIENT_SECRET,
      redirect_uri: callbackUri,
      code,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await this.#requestSocialJson(
      'https://kauth.kakao.com/oauth/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: tokenParams,
      },
      'Kakao 토큰 요청에 실패했습니다.',
    );

    const profileResponse = await this.#requestSocialJson(
      'https://kapi.kakao.com/v2/user/me',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
        body: new URLSearchParams(),
      },
      'Kakao 프로필 조회에 실패했습니다.',
    );

    const nickname =
      profileResponse.kakao_account?.profile?.nickname ??
      profileResponse.properties?.nickname ??
      'Kakao User';

    return {
      id: String(profileResponse.id),
      email: profileResponse.kakao_account?.email ?? null,
      emailVerified:
        profileResponse.kakao_account?.is_email_valid === true &&
        profileResponse.kakao_account?.is_email_verified === true,
      name: nickname,
    };
  }

  async #getNaverProfile(code, state, codeVerifier) {
    const callbackUri = `${config.API_BASE_URL}/api/auth/social/callback/naver`;

    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.NAVER_CLIENT_ID,
      client_secret: config.NAVER_CLIENT_SECRET,
      code,
      state,
      redirect_uri: callbackUri,
      code_verifier: codeVerifier,
    });

    const tokenResponse = await this.#requestSocialJson(
      'https://nid.naver.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams,
      },
      'Naver 토큰 요청에 실패했습니다.',
    );

    const profilePayload = await this.#requestSocialJson(
      'https://openapi.naver.com/v1/nid/me',
      {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      },
      'Naver 프로필 조회에 실패했습니다.',
    );

    const profileResponse = profilePayload.response;

    return {
      id: String(profileResponse.id),
      email: profileResponse.email ?? null,
      emailVerified: false,
      name:
        profileResponse.name ??
        profileResponse.nickname ??
        profileResponse.email ??
        'Naver User',
    };
  }

  #resolveEmail({ provider, profile }) {
    if (profile.email && profile.emailVerified) {
      return profile.email.toLowerCase();
    }

    const socialIdentityDigest = createHash('sha256')
      .update(`${provider}:${String(profile.id)}`)
      .digest('base64url');
    return `${provider}_${socialIdentityDigest}@social.local`;
  }

  async #requestSocialJson(url, options, defaultErrorMessage) {
    const response = await fetch(url, options);
    const rawText = await response.text();
    let payload = null;

    if (rawText) {
      try {
        payload = JSON.parse(rawText);
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const message =
        payload?.error_description ??
        payload?.error ??
        payload?.message ??
        payload?.msg ??
        payload?.extras?.detailMsg ??
        (rawText || response.statusText || defaultErrorMessage);

      throw new UnauthorizedException(
        message ?? ERROR_MESSAGE.SOCIAL_AUTH_FAILED,
      );
    }

    return payload;
  }
}
