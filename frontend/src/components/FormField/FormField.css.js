import { style } from '@vanilla-extract/css';
import { media, vars } from '@/styles/tokens.css';

const baseInput = {
  width: '100%',
  border: `1px solid ${vars.color.gray200}`,
  borderRadius: vars.radius.md,
  backgroundColor: vars.color.gray100,
  color: vars.color.gray800,
  padding: '16px 24px',
  fontSize: '16px',
  lineHeight: '24px',
};

export const label = style({
  display: 'block',
  marginBottom: vars.space.sm,
  fontSize: '14px',
  fontWeight: 700,
  '@media': {
    [media.tablet]: {
      fontSize: '18px',
    },
  },
});

export const input = style({
  ...baseInput,
  selectors: {
    '&::placeholder': {
      color: vars.color.gray400,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.blue}`,
      outlineOffset: '1px',
    },
  },
});

export const textarea = style([
  input,
  {
    resize: 'none',
    minHeight: '200px',
  },
]);

export const error = style({
  color: vars.color.red,
  display: 'block',
  marginTop: '6px',
  fontWeight: 600,
  fontSize: '14px',
});
