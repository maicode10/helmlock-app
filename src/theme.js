// HelmLock colors: red + matte black (same as the website)
export const colors = {
  ink: '#0f0f10', // screen background
  surface: '#18181b', // cards
  surface2: '#232326', // inputs, raised items
  line: '#2e2e33', // borders

  text: '#f4f4f5', // soft white, easier on the eyes
  textSoft: '#d4d4d8',
  muted: '#a1a1aa',
  faint: '#71717a',

  brand: '#dc2626',
  brandDark: '#b91c1c',
  brandBright: '#ef4444',
  brandText: '#f87171',
  brandSoft: 'rgba(220, 38, 38, 0.15)',
  brandBorder: 'rgba(220, 38, 38, 0.35)',

  green: '#34d399',
  greenSoft: 'rgba(16, 185, 129, 0.15)',
  amber: '#fcd34d',
  amberSoft: 'rgba(245, 158, 11, 0.15)',
  grey: '#a1a1aa',
  greySoft: 'rgba(161, 161, 170, 0.15)',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, full: 999 };

export const font = {
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  h2: { fontSize: 18, fontWeight: '700', color: colors.text },
  body: { fontSize: 14, color: colors.textSoft },
  small: { fontSize: 12, color: colors.muted },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSoft },
};
