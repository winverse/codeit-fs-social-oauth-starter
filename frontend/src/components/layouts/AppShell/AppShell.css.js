import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const shell = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

export const main = style({
  flex: 1,
  paddingTop: vars.size.headerHeight,
});
