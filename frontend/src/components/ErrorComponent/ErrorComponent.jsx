'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import * as styles from './ErrorComponent.css';

export function ErrorComponent({
  error,
  onRetry,
  title,
  description,
  linkHref,
  linkLabel,
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error(error);
    }
  }, [error]);

  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>

        {error?.message ? (
          <p className={styles.errorBox}>오류 메시지: {error.message}</p>
        ) : null}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionPrimaryButton}
            onClick={onRetry}
          >
            다시 시도
          </button>
          <Link href={linkHref} className={styles.actionButton}>
            {linkLabel}
          </Link>
        </div>
      </section>
    </main>
  );
}
