import { style } from '@vanilla-extract/css';
import { media, vars } from '@/styles/tokens.css';

export const header = style({
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: vars.size.headerHeight,
  borderBottom: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  zIndex: 100,
});

export const inner = style({
  maxWidth: vars.size.maxContentWidth,
  height: '100%',
  margin: '0 auto',
  paddingLeft: vars.space.md,
  paddingRight: vars.space.md,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  '@media': {
    [media.tablet]: {
      paddingLeft: vars.space.lg,
      paddingRight: vars.space.lg,
    },
    [media.desktop]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
});

export const left = style({
  display: 'flex',
  alignItems: 'center',
  gap: vars.space.md,
});

export const logoLink = style({
  display: 'inline-flex',
  alignItems: 'center',
});

export const loginLink = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '80px',
  height: '42px',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.blue,
  color: vars.color.white,
  fontWeight: 700,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.blueHover,
    },
  },
});

export const sessionSkeleton = style({
  width: '112px',
  height: '42px',
  borderRadius: vars.radius.pill,
  backgroundColor: vars.color.gray100,
});

export const userMenu = style({
  position: 'relative',
});

export const userButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: vars.space.xs,
  maxWidth: '220px',
  height: '42px',
  paddingLeft: '14px',
  paddingRight: '14px',
  borderRadius: vars.radius.pill,
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  color: vars.color.gray900,
  fontWeight: 700,
  selectors: {
    '&:hover': {
      backgroundColor: vars.color.gray50,
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.blueFocus}`,
      outlineOffset: '2px',
    },
  },
});

export const userName = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const menuChevron = style({
  color: vars.color.gray500,
  transition: 'transform 0.16s ease',
});

export const menuChevronOpen = style({
  transform: 'rotate(180deg)',
});

export const menuPopover = style({
  position: 'absolute',
  top: 'calc(100% + 10px)',
  right: 0,
  minWidth: '180px',
  padding: vars.space.sm,
  borderRadius: vars.radius.md,
  border: `1px solid ${vars.color.gray200}`,
  backgroundColor: vars.color.white,
  boxShadow: '0 18px 40px rgba(17, 24, 39, 0.12)',
});

export const menuStatus = style({
  margin: 0,
  padding: `0 ${vars.space.xs} ${vars.space.xs}`,
  color: vars.color.gray500,
  fontSize: '13px',
  fontWeight: 600,
});

export const menuItemButton = style({
  width: '100%',
  height: '40px',
  borderRadius: vars.radius.sm,
  backgroundColor: vars.color.white,
  color: vars.color.gray900,
  fontWeight: 600,
  textAlign: 'left',
  paddingLeft: vars.space.sm,
  paddingRight: vars.space.sm,
  selectors: {
    '&:hover:not(:disabled)': {
      backgroundColor: vars.color.gray50,
    },
    '&:disabled': {
      color: vars.color.gray400,
      cursor: 'wait',
    },
    '&:focus-visible': {
      outline: `2px solid ${vars.color.blueFocus}`,
      outlineOffset: '2px',
    },
  },
});
