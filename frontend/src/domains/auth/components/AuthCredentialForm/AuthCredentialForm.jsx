'use client';

import { FormField } from '@/components/FormField';
import * as styles from './AuthCredentialForm.css';

export function AuthCredentialForm({
  mode,
  name,
  email,
  password,
  message,
  isPending,
  submitLabel,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onFieldBlur,
  onSubmit,
}) {
  return (
    <form className={styles.form} onSubmit={onSubmit}>
      {mode === 'signup' ? (
        <FormField
          id="name"
          label="이름"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="이름을 입력해 주세요"
          onBlur={onFieldBlur}
          autoComplete="name"
        />
      ) : null}

      <FormField
        id="email"
        label="이메일"
        type="email"
        value={email}
        onChange={(event) => onEmailChange(event.target.value)}
        placeholder="example@email.com"
        onBlur={onFieldBlur}
        autoComplete="email"
      />

      <FormField
        id="password"
        label="비밀번호"
        type="password"
        value={password}
        onChange={(event) => onPasswordChange(event.target.value)}
        placeholder="비밀번호를 입력해 주세요"
        onBlur={onFieldBlur}
        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
      />

      <p className={styles.message}>{message}</p>

      <button
        className={styles.submitButton}
        type="submit"
        disabled={isPending}
      >
        {isPending ? '처리 중...' : submitLabel}
      </button>
    </form>
  );
}
