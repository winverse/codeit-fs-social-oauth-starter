import { AppHeader } from '@/components/layouts/AppHeader';
import * as styles from './AppShell.css';

export function AppShell({ children }) {
  return (
    <div className={styles.shell}>
      <AppHeader />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
