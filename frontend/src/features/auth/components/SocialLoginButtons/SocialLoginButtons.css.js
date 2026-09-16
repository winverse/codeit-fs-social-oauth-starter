import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const buttonHoverShadow = '0 10px 18px rgba(17, 24, 39, 0.08)';

export const socialGrid = style({
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: vars.space.sm,
});

export const socialButton = style({
  width: '100%',
  minHeight: '48px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: `0 ${vars.space.md}`,
  borderRadius: vars.radius.sm,
  border: '1px solid transparent',
  boxSizing: 'border-box',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  selectors: {
    '&:hover': {
      transform: 'translateY(-1px)',
      boxShadow: buttonHoverShadow,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.blue}`,
      outlineOffset: '2px',
    },
  },
});

export const buttonContent = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const label = style({
  fontSize: '16px',
  lineHeight: 1.2,
  textAlign: 'center',
  whiteSpace: 'nowrap',
});
