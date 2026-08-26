import { style } from '@vanilla-extract/css';
import { media, vars } from '@/styles/tokens.css';

export const pageContainer = style({
  display: 'flex',
  flexDirection: 'column',
  padding: vars.space.md,
  width: '100%',
  maxWidth: vars.size.maxContentWidth,
  margin: '0 auto',
  '@media': {
    [media.tablet]: {
      paddingLeft: vars.space.lg,
      paddingRight: vars.space.lg,
    },
    [media.desktop]: {
      paddingTop: vars.space.lg,
      paddingBottom: vars.space.lg,
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
});

export const sectionHeader = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: vars.space.sm,
  marginBottom: vars.space.md,
  '@media': {
    [media.tablet]: {
      marginBottom: vars.space.lg,
    },
  },
});

export const sectionTitle = style({
  fontSize: '20px',
  fontWeight: 700,
  color: vars.color.gray800,
  '@media': {
    [media.tablet]: {
      fontSize: '28px',
    },
  },
});

export const lineDivider = style({
  width: '100%',
  border: 0,
  height: '1px',
  background: vars.color.gray200,
});

export const primaryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.blue,
  color: vars.color.white,
  fontWeight: 700,
  padding: '11.5px 23px',
  transition: 'background-color 150ms ease',
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blueHover,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.blueFocus}`,
      outlineOffset: '2px',
    },
    '&:disabled': {
      backgroundColor: vars.color.gray400,
      cursor: 'default',
    },
  },
});

export const pillButton = style([
  primaryButton,
  {
    borderRadius: vars.radius.pill,
    fontSize: '16px',
    fontWeight: 600,
    padding: '14.5px 33.5px',
    '@media': {
      [media.tablet]: {
        fontSize: '20px',
        fontWeight: 700,
        padding: '16px 126px',
      },
    },
  },
]);
