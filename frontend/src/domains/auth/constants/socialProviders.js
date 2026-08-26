function createSocialProvider({
  key,
  label,
  buttonStyle = {},
  labelStyle = {},
}) {
  return {
    key,
    label,
    buttonStyle: {
      backgroundColor: '#FFFFFF',
      borderColor: '#D1D5DB',
      ...buttonStyle,
    },
    labelStyle: {
      color: '#1F2937',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      ...labelStyle,
    },
  };
}

export const SOCIAL_PROVIDERS = [
  createSocialProvider({
    key: 'google',
    label: 'Google OAuth 흐름 테스트',
  }),
  createSocialProvider({
    key: 'kakao',
    label: 'Kakao OAuth 흐름 테스트',
  }),
  createSocialProvider({
    key: 'naver',
    label: 'Naver OAuth 흐름 테스트',
  }),
];
