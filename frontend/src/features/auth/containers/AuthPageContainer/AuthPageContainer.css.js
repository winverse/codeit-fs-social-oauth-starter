import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const root = style({
  maxWidth: '480px',
  margin: '0 auto',
  padding: '72px 16px 96px',
});

export const card = style({
  border: `1px solid ${vars.color.gray200}`,
  borderRadius: vars.radius.lg,
  backgroundColor: vars.color.white,
  padding: '28px',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
});

export const title = style({
  color: vars.color.gray900,
  fontSize: '28px',
  lineHeight: 1.2,
  fontWeight: 800,
});

export const subtitle = style({
  color: vars.color.gray600,
  fontSize: '14px',
  lineHeight: 1.5,
});

export const divider = style({
  position: 'relative',
  textAlign: 'center',
  color: vars.color.gray500,
  fontSize: '12px',
  selectors: {
    '&::before': {
      content: '',
      position: 'absolute',
      top: '50%',
      left: 0,
      right: 0,
      height: '1px',
      backgroundColor: vars.color.gray200,
    },
  },
});

export const dividerText = style({
  position: 'relative',
  backgroundColor: vars.color.white,
  padding: '0 10px',
});
