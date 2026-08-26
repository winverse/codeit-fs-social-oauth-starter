import { createGlobalTheme } from '@vanilla-extract/css';

export const vars = createGlobalTheme(':root', {
  color: {
    white: '#ffffff',
    black: '#111827',
    blue: '#3692ff',
    blueHover: '#1967d6',
    blueFocus: '#1251aa',
    red: '#f74747',
    gray900: '#111827',
    gray800: '#1f2937',
    gray700: '#374151',
    gray600: '#4b5563',
    gray500: '#6b7280',
    gray400: '#9ca3af',
    gray200: '#e5e7eb',
    gray100: '#f3f4f6',
    gray50: '#f9fafb',
  },
  radius: {
    sm: '8px',
    md: '12px',
    lg: '20px',
    pill: '999px',
  },
  space: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '40px',
  },
  size: {
    headerHeight: '70px',
    maxContentWidth: '1200px',
  },
  font: {
    body: 'Pretendard, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  },
});

export const media = {
  tablet: 'screen and (min-width: 768px)',
  desktop: 'screen and (min-width: 1280px)',
};
