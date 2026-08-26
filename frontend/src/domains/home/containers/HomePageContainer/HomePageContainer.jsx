'use client';

import Link from 'next/link';
import { useLogoutAction } from '@/domains/auth/hooks/useLogoutAction';
import { useAuthSession } from '@/domains/auth/hooks/useAuthSession';
import * as styles from './HomePageContainer.css';

export function HomePageContainer() {
  const { data: user, isPending } = useAuthSession();
  const logoutMutation = useLogoutAction();
  const isLoggedIn = Boolean(user);
  const displayName = user?.name?.trim() || user?.email;

  return (
    <section className={styles.root}>
      <p className={styles.statusBadge}>
        {isPending ? '세션 확인 중' : isLoggedIn ? '로그인됨' : '비로그인 상태'}
      </p>

      <h1 className={styles.title}>
        {isLoggedIn ? (
          <>
            {displayName}님,
            <br />
            로그인되었습니다
          </>
        ) : (
          <>
            OAuth 인증
            <br />
            데모 프로젝트
          </>
        )}
      </h1>

      <p className={styles.desc}>
        {isLoggedIn
          ? '현재 세션이 활성화되어 있습니다. 홈 화면에서도 바로 로그아웃할 수 있습니다.'
          : '이메일 회원가입, 일반 로그인, Google/Kakao/Naver 소셜 로그인 흐름만 남긴 최소 구성입니다.'}
      </p>

      {isLoggedIn ? (
        <div className={styles.summaryCard}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>이름</span>
            <span className={styles.summaryValue}>
              {user?.name?.trim() || '-'}
            </span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>이메일</span>
            <span className={styles.summaryValue}>{user?.email}</span>
          </div>
        </div>
      ) : null}

      <div className={styles.linkRow}>
        {isLoggedIn ? (
          <button
            type="button"
            className={styles.primaryButton}
            disabled={logoutMutation.isPending}
            onClick={() => logoutMutation.mutate()}
          >
            {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
          </button>
        ) : (
          <Link href="/login" className={styles.primaryLink}>
            로그인 / 회원가입
          </Link>
        )}
      </div>
    </section>
  );
}
