import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.sm,
});

export const submitButton = style({
  marginTop: '4px',
  minHeight: '48px',
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.blue,
  color: vars.color.white,
  fontWeight: 700,
  selectors: {
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
});

export const message = style({
  minHeight: '20px',
  fontSize: '13px',
  lineHeight: 1.4,
  color: vars.color.red,
});
