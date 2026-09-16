'use client';

import * as styles from './SocialLoginButtons.css';

function SocialLoginButton({ provider, onClick }) {
  const { key, label, buttonStyle, labelStyle } = provider;

  return (
    <button
      type="button"
      aria-label={label}
      className={styles.socialButton}
      style={buttonStyle}
      onClick={() => onClick(key)}
    >
      <span className={styles.buttonContent}>
        <span className={styles.label} style={labelStyle}>
          {label}
        </span>
      </span>
    </button>
  );
}

export function SocialLoginButtons({ providers, onSocialLogin }) {
  return (
    <div className={styles.socialGrid}>
      {providers.map((provider) => (
        <SocialLoginButton
          key={provider.key}
          provider={provider}
          onClick={onSocialLogin}
        />
      ))}
    </div>
  );
}
