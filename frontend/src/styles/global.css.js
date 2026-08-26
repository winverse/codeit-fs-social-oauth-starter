import { globalStyle } from '@vanilla-extract/css';
import { vars } from '@/styles/tokens.css';

globalStyle('*', {
  boxSizing: 'border-box',
  margin: 0,
  padding: 0,
});

globalStyle('html, body', {
  width: '100%',
});

globalStyle('body', {
  fontFamily: vars.font.body,
  color: vars.color.gray700,
  backgroundColor: vars.color.white,
  wordBreak: 'keep-all',
});

globalStyle('a', {
  color: 'inherit',
  textDecoration: 'none',
});

globalStyle('button, input, textarea, select', {
  font: 'inherit',
  color: 'inherit',
});

globalStyle('button', {
  border: 0,
  background: 'none',
  cursor: 'pointer',
});

globalStyle('img, svg', {
  verticalAlign: 'bottom',
});
