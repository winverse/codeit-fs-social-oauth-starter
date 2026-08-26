import { style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

export const modeRow = style({
  display: 'flex',
  borderRadius: vars.radius.pill,
  padding: '4px',
  gap: '4px',
  backgroundColor: vars.color.gray100,
});

export const modeButton = style({
  flex: 1,
  minHeight: '40px',
  borderRadius: vars.radius.pill,
  fontWeight: 700,
  color: vars.color.gray700,
});

export const modeButtonActive = style({
  backgroundColor: vars.color.white,
  color: vars.color.gray900,
  boxShadow: '0 1px 2px rgba(17, 24, 39, 0.12)',
});
