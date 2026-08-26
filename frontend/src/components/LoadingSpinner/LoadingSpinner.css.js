import { keyframes, style } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

const pulse = keyframes({
  '0%': { transform: 'scale(0.8)', opacity: 0.45 },
  '50%': { transform: 'scale(1)', opacity: 1 },
  '100%': { transform: 'scale(0.8)', opacity: 0.45 },
});

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0,0,0,0.2)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 200,
});

export const dotGroup = style({
  display: 'inline-flex',
  gap: '8px',
});

export const dot = style({
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  backgroundColor: vars.color.blue,
  animation: `${pulse} 850ms infinite ease-in-out`,
});

export const dotDelay = style({
  animationDelay: '120ms',
});

export const dotDelay2 = style({
  animationDelay: '240ms',
});
