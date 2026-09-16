'use client';

import { AuthModeSwitch } from '@/features/auth/components/AuthModeSwitch';
import { AuthCredentialForm } from '@/features/auth/components/AuthCredentialForm';
import { SocialLoginButtons } from '@/features/auth/components/SocialLoginButtons';
import { SOCIAL_PROVIDERS } from '@/features/auth/constants/socialProviders';
import { useAuthPageModel } from '@/features/auth/hooks/useAuthPageModel';
import * as styles from './AuthPageContainer.css';

export function AuthPageContainer() {
  const {
    mode,
    name,
    email,
    password,
    message,
    submitLabel,
    isPending,
    setName,
    setEmail,
    setPassword,
    clearMessage,
    selectMode,
    submit,
    moveToSocialLogin,
  } = useAuthPageModel();

  return (
    <section className={styles.root}>
      <div className={styles.card}>
        <h1 className={styles.title}>로그인 / 회원가입</h1>
        <p className={styles.subtitle}>
          이메일/비밀번호 또는 소셜 계정으로 바로 시작할 수 있습니다.
        </p>

        <AuthModeSwitch mode={mode} onSelectMode={selectMode} />

        <AuthCredentialForm
          mode={mode}
          name={name}
          email={email}
          password={password}
          message={message}
          isPending={isPending}
          submitLabel={submitLabel}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onFieldBlur={clearMessage}
          onSubmit={submit}
        />

        <div className={styles.divider}>
          <span className={styles.dividerText}>또는 소셜 계정</span>
        </div>

        <SocialLoginButtons
          providers={SOCIAL_PROVIDERS}
          onSocialLogin={moveToSocialLogin}
        />
      </div>
    </section>
  );
}
