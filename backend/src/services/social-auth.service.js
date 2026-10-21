import { createHash } from 'node:crypto';
import { z } from 'zod';
import { config } from '#config';
import { ERROR_MESSAGE } from '#constants';
import { ConflictException, UnauthorizedException } from '#exceptions';
import { canonicalizeEmail } from '../common/utils/email.js';

const accessTokenResponseSchema = z.object({
  access_token: z.string().min(1),
});

const googleProfileSchema = z.object({
  sub: z.string().min(1),
  email: z.email().nullable().optional(),
  email_verified: z.boolean().optional(),
  name: z.string().min(1).optional(),
});

const kakaoProfileSchema = z.object({
  id: z.union([z.string().min(1), z.number().finite()]),
  kakao_account: z
    .object({
      email: z.email().nullable().optional(),
      is_email_valid: z.boolean().optional(),
      is_email_verified: z.boolean().optional(),
      profile: z.object({ nickname: z.string().min(1).optional() }).optional(),
    })
    .optional(),
  properties: z.object({ nickname: z.string().min(1).optional() }).optional(),
});

const naverProfileSchema = z.object({
  response: z.object({
    id: z.string().min(1),
    email: z.email().nullable().optional(),
    name: z.string().min(1).optional(),
    nickname: z.string().min(1).optional(),
  }),
});

export class SocialAuthService {
  #userRepository;
  #tokenProvider;
  #profileFetchers = {
    google: (input) => this.#getGoogleProfile(input),
    kakao: (input) => this.#getKakaoProfile(input),
    naver: (input) => this.#getNaverProfile(input),
  };

  constructor({ userRepository, tokenProvider }) {
    this.#userRepository = userRepository;
    this.#tokenProvider = tokenProvider;
  }

  // 인가 요청과 토큰 요청은 이 함수가 만든 같은 redirect_uri를 보냅니다.
  static getCallbackUri(provider) {
    return `${config.API_BASE_URL}/api/auth/social/callback/${provider}`;
  }

  async getSocialProfile(provider, { code, state, codeVerifier }) {
    return this.#profileFetchers[provider]({ code, state, codeVerifier });
  }

  async loginOrSignUp({ provider, profile }) {
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

  async #getGoogleProfile({ code, codeVerifier }) {
    const tokenResponse = this.#parseSocialResponse(
      accessTokenResponseSchema,
      await this.#requestSocialJson(
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
            redirect_uri: SocialAuthService.getCallbackUri('google'),
            grant_type: 'authorization_code',
            code_verifier: codeVerifier,
          }),
        },
        'Google 토큰 요청에 실패했습니다.',
      ),
    );

    const profileResponse = this.#parseSocialResponse(
      googleProfileSchema,
      await this.#requestSocialJson(
        'https://openidconnect.googleapis.com/v1/userinfo',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        },
        'Google 프로필 조회에 실패했습니다.',
      ),
    );

    return {
      id: String(profileResponse.sub),
      email: profileResponse.email ?? null,
      emailVerified: profileResponse.email_verified === true,
      name: profileResponse.name ?? 'Google User',
    };
  }

  async #getKakaoProfile({ code, codeVerifier }) {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.KAKAO_CLIENT_ID,
      client_secret: config.KAKAO_CLIENT_SECRET,
      redirect_uri: SocialAuthService.getCallbackUri('kakao'),
      code,
      code_verifier: codeVerifier,
    });

    const tokenResponse = this.#parseSocialResponse(
      accessTokenResponseSchema,
      await this.#requestSocialJson(
        'https://kauth.kakao.com/oauth/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
          body: tokenParams,
        },
        'Kakao 토큰 요청에 실패했습니다.',
      ),
    );

    const profileResponse = this.#parseSocialResponse(
      kakaoProfileSchema,
      await this.#requestSocialJson(
        'https://kapi.kakao.com/v2/user/me',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
          },
        },
        'Kakao 프로필 조회에 실패했습니다.',
      ),
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

  async #getNaverProfile({ code, state, codeVerifier }) {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.NAVER_CLIENT_ID,
      client_secret: config.NAVER_CLIENT_SECRET,
      code,
      state,
      redirect_uri: SocialAuthService.getCallbackUri('naver'),
      code_verifier: codeVerifier,
    });

    const tokenResponse = this.#parseSocialResponse(
      accessTokenResponseSchema,
      await this.#requestSocialJson(
        'https://nid.naver.com/oauth2/token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: tokenParams,
        },
        'Naver 토큰 요청에 실패했습니다.',
      ),
    );

    const profilePayload = this.#parseSocialResponse(
      naverProfileSchema,
      await this.#requestSocialJson(
        'https://openapi.naver.com/v1/nid/me',
        {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`,
          },
        },
        'Naver 프로필 조회에 실패했습니다.',
      ),
    );

    const profileResponse = profilePayload.response;

    return {
      id: String(profileResponse.id),
      email: profileResponse.email ?? null,
      // Naver의 email은 사용자가 바꾼 외부 메일일 수 있고 인증 여부를 알려 주지 않습니다.
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
      return canonicalizeEmail(profile.email);
    }

    // 계약의 email은 비울 수 없고 겹칠 수 없으므로 공급자와 ID로 대신 만듭니다.
    const socialIdentityDigest = createHash('sha256')
      .update(`${provider}:${String(profile.id)}`)
      .digest('base64url');
    return `${provider}_${socialIdentityDigest}@social.local`;
  }

  #parseSocialResponse(schema, payload) {
    const result = schema.safeParse(payload);
    if (!result.success) {
      throw new UnauthorizedException(ERROR_MESSAGE.SOCIAL_AUTH_FAILED);
    }
    return result.data;
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
