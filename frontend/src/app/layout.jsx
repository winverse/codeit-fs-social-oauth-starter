import { AppShell } from '@/components/layouts/AppShell';
import { ReactQueryProvider } from '@/providers/ReactQueryProvider';
import '@/styles/global.css.js';

export const metadata = {
  title: '판다마켓',
  description: '판다마켓 게시판',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <ReactQueryProvider>
          <AppShell>{children}</AppShell>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
