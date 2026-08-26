'use client';

import clsx from 'clsx';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { APP_LOGO_SIZE } from '@/constants/uiDimensions';
import { useLogoutAction } from '@/domains/auth/hooks/useLogoutAction';
import { useAuthSession } from '@/domains/auth/hooks/useAuthSession';
import * as styles from './AppHeader.css';

export function AppHeader() {
  const menuRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user, isPending } = useAuthSession();

  const logoutMutation = useLogoutAction({
    onSuccess: () => {
      setIsMenuOpen(false);
    },
  });

  const closeMenuIfOutside = useEffectEvent((event) => {
    if (!menuRef.current?.contains(event.target)) {
      setIsMenuOpen(false);
    }
  });

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event) => closeMenuIfOutside(event);
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const displayName = user?.name?.trim() || user?.email;
  const chevronClassName = clsx(
    styles.menuChevron,
    isMenuOpen && styles.menuChevronOpen,
  );

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.left}>
          <Link href="/" className={styles.logoLink} aria-label="홈으로 이동">
            <Image
              src="/images/logo/logo.svg"
              alt="판다마켓 로고"
              width={APP_LOGO_SIZE.width}
              height={APP_LOGO_SIZE.height}
              priority={true}
            />
          </Link>
        </div>

        {isPending ? (
          <div className={styles.sessionSkeleton} aria-hidden={true} />
        ) : user ? (
          <div className={styles.userMenu} ref={menuRef}>
            <button
              type="button"
              className={styles.userButton}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((open) => !open)}
            >
              <span className={styles.userName}>{displayName}</span>
              <span className={chevronClassName} aria-hidden={true}>
                ▾
              </span>
            </button>

            {isMenuOpen ? (
              <div className={styles.menuPopover} role="menu">
                <p className={styles.menuStatus}>로그인됨</p>
                <button
                  type="button"
                  role="menuitem"
                  className={styles.menuItemButton}
                  disabled={logoutMutation.isPending}
                  onClick={() => logoutMutation.mutate()}
                >
                  {logoutMutation.isPending ? '로그아웃 중...' : '로그아웃'}
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <Link href="/login" className={styles.loginLink}>
            로그인
          </Link>
        )}
      </div>
    </header>
  );
}
