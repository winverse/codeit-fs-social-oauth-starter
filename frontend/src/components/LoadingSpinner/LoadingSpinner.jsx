import clsx from 'clsx';
import * as styles from './LoadingSpinner.css';

export function LoadingSpinner({ isVisible }) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <span className={styles.dotGroup}>
        <span className={styles.dot} />
        <span className={clsx(styles.dot, styles.dotDelay)} />
        <span className={clsx(styles.dot, styles.dotDelay2)} />
      </span>
    </div>
  );
}
