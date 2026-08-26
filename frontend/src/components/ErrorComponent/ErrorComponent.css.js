import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const wrapper = style({
  maxWidth: vars.size.maxContentWidth,
  margin: '0 auto',
  minHeight: '60vh',
  padding: '64px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const card = style({
  width: '100%',
  maxWidth: '560px',
  border: `1px solid ${vars.color.gray200}`,
  borderRadius: vars.radius.md,
  padding: '28px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: vars.space.md,
  backgroundColor: vars.color.white,
});

export const title = style({
  fontSize: '22px',
  fontWeight: 800,
  color: vars.color.gray900,
  lineHeight: 1.3,
});

export const description = style({
  color: vars.color.gray600,
  fontSize: '15px',
  lineHeight: 1.6,
});

export const errorBox = style({
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.gray100,
  color: vars.color.gray700,
  fontSize: '13px',
  lineHeight: 1.5,
  padding: '12px 14px',
  wordBreak: 'break-word',
});

export const actions = style({
  display: 'flex',
  gap: vars.space.xs,
  flexWrap: 'wrap',
});

export const actionButton = style({
  minHeight: '40px',
  borderRadius: vars.radius.sm,
  border: `1px solid ${vars.color.gray200}`,
  padding: '0 14px',
  color: vars.color.gray700,
  fontWeight: 700,
  selectors: {
    '&:hover': {
      borderColor: vars.color.blue,
      color: vars.color.blue,
    },
  },
});

export const actionPrimaryButton = style([
  actionButton,
  {
    borderColor: vars.color.blue,
    backgroundColor: vars.color.blue,
    color: vars.color.white,
    selectors: {
      '&:hover': {
        borderColor: vars.color.blueHover,
        backgroundColor: vars.color.blueHover,
        color: vars.color.white,
      },
    },
  },
]);
