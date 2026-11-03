// HelmLock colors, taken from the Figma design: deep red fading into black
export const colors = {
  ink: '#030303', // plain black (Welcome screen, behind everything)
  surface: 'rgba(18, 18, 20, 0.86)', // cards (a little see-through so the red glows behind)
  surfaceSolid: '#141416', // popups and the bottom menu
  surface2: 'rgba(255, 255, 255, 0.14)', // text boxes, chips, raised items (the grey boxes in Figma)
  line: 'rgba(255, 255, 255, 0.10)', // borders

  text: '#f6f6f7',
  textSoft: '#dedee2',
  muted: '#b4b4bb',
  faint: '#8a8a93',

  brand: '#a01010', // main red buttons (Sign Up, Create Account)
  brandDark: '#7d0b0b',
  brandBright: '#e3252b', // links, focus, active tab
  brandText: '#ff5b5b',
  brandSoft: 'rgba(227, 37, 43, 0.16)',
  brandBorder: 'rgba(227, 37, 43, 0.40)',
  stepCard: '#5a0606', // the dark red Step 1-2-3 cards on Welcome

  grayButton: '#4f4646', // the Log In button and other second buttons
  arrow: '#0a0a0a', // back arrow on the red top

  error: '#ff3b3b',
  errorFill: 'rgba(40, 0, 0, 0.55)',

  green: '#34d399',
  greenSoft: 'rgba(16, 185, 129, 0.15)',
  amber: '#fcd34d',
  amberSoft: 'rgba(245, 158, 11, 0.15)',
  grey: '#a1a1aa',
  greySoft: 'rgba(161, 161, 170, 0.15)',
};

// Background of every screen except Welcome (top to bottom)
// Darker red on top so the logo and the LOCK text stand out
export const backgroundGradient = [
  { offset: 0, color: '#5c0707' },
  { offset: 0.22, color: '#3d0404' },
  { offset: 0.48, color: '#140101' },
  { offset: 0.62, color: '#000000' },
  { offset: 1, color: '#050505' },
];

export const radius = { sm: 8, md: 10, lg: 16, xl: 24, full: 999 };

export const font = {
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.textSoft },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 13, fontWeight: '700', color: colors.text },
};