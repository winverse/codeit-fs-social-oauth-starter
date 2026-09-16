import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const root = style({
  maxWidth: vars.size.maxContentWidth,
  margin: '0 auto',
  padding: '64px 16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: vars.space.lg,
});

export const statusBadge = style({
  margin: 0,
  minHeight: '32px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0 14px',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray100,
  color: vars.color.gray700,
  fontSize: '14px',
  fontWeight: 700,
});

export const title = style({
  color: vars.color.gray900,
  fontSize: '40px',
  lineHeight: 1.2,
  fontWeight: 800,
});

export const desc = style({
  color: vars.color.gray600,
  fontSize: '18px',
  lineHeight: 1.55,
});

export const linkRow = style({
  display: 'flex',
  gap: vars.space.sm,
});

export const summaryCard = style({
  width: '100%',
  maxWidth: '520px',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
  padding: vars.space.md,
  borderRadius: vars.radius.lg,
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.gray50,
});

export const summaryRow = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
});

export const summaryLabel = style({
  color: vars.color.gray500,
  fontSize: '13px',
  fontWeight: 700,
});

export const summaryValue = style({
  color: vars.color.gray900,
  fontSize: '16px',
  fontWeight: 700,
  wordBreak: 'break-all',
});

export const primaryLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '46px',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.blue,
  color: vars.color.white,
  fontWeight: 700,
  padding: '0 20px',
});

export const primaryButton = style([
  primaryLink,
  {
    border: 0,
    cursor: 'pointer',
    selectors: {
      '&:disabled': {
        backgroundColor: vars.color.gray400,
        cursor: 'wait',
      },
    },
  },
]);
