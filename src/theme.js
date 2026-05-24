/**
 * MBAce Design Tokens — Light Mode Redesign
 * Outfit (display) + Plus Jakarta Sans (body)
 * Primary: Indigo #4648d4 · Secondary: Hot Pink #b4136d
 */

export const T = {
  // ── Backgrounds ──────────────────────────────────────────────────────────
  bg: '#fcf8ff',
  mesh: [
    'radial-gradient(ellipse at 0% 0%, rgba(70,72,212,0.08) 0px, transparent 55%)',
    'radial-gradient(ellipse at 100% 100%, rgba(180,19,109,0.06) 0px, transparent 55%)',
    'radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.05) 0px, transparent 55%)',
  ].join(', '),

  // ── Surfaces ─────────────────────────────────────────────────────────────
  glass: {
    background: 'rgba(255,255,255,0.80)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.55)',
  },
  surfaceContainer: '#efecf8',
  surfaceContainerLow: '#f5f2fe',
  surfaceSolid: '#ffffff',
  softGrey: '#F8FAFC',

  // ── Text ─────────────────────────────────────────────────────────────────
  text: '#1b1b23',
  textSub: '#464554',
  textMuted: '#767586',

  // ── Borders ──────────────────────────────────────────────────────────────
  border: '#c7c4d7',
  borderStrong: '#767586',

  // ── Primary — Indigo/Purple ───────────────────────────────────────────────
  primary: '#4648d4',
  primaryDark: '#2f2ebe',
  primaryContainer: '#6063ee',
  primaryLight: 'rgba(70,72,212,0.10)',
  primaryBorder: 'rgba(70,72,212,0.20)',
  onPrimary: '#ffffff',

  // ── Secondary — Hot Pink ─────────────────────────────────────────────────
  secondary: '#b4136d',
  secondaryContainer: '#fd56a7',
  secondaryLight: 'rgba(180,19,109,0.10)',
  onSecondary: '#ffffff',

  // ── Accents ──────────────────────────────────────────────────────────────
  blue:         '#3B82F6',
  blueLight:    'rgba(59,130,246,0.10)',
  blueBorder:   'rgba(59,130,246,0.20)',

  purple:       '#A855F7',
  purpleLight:  'rgba(168,85,247,0.10)',
  purpleBorder: 'rgba(168,85,247,0.20)',

  green:        '#84CC16',   // "Know It" / correct / success
  greenLight:   'rgba(132,204,22,0.10)',
  greenBorder:  'rgba(132,204,22,0.25)',

  amber:        '#F59E0B',   // "Unsure" / warning
  amberLight:   'rgba(245,158,11,0.10)',
  amberBorder:  'rgba(245,158,11,0.25)',

  pink:         '#F43F5E',   // "Again" / danger / error
  pinkLight:    'rgba(244,63,94,0.10)',
  pinkBorder:   'rgba(244,63,94,0.25)',

  // ── Typography ───────────────────────────────────────────────────────────
  fontDisplay: "'Outfit', sans-serif",
  fontBody:    "'Plus Jakarta Sans', sans-serif",

  // ── Border Radius ─────────────────────────────────────────────────────────
  r: { sm: 8, md: 12, lg: 16, xl: 20, full: 9999 },

  // ── Shadows ──────────────────────────────────────────────────────────────
  shadow: {
    sm:      '0 2px 8px rgba(70,72,212,0.07)',
    md:      '0 4px 20px rgba(70,72,212,0.10)',
    lg:      '0 8px 32px rgba(70,72,212,0.14)',
    primary: '0 4px 20px rgba(70,72,212,0.30)',
    green:   '0 4px 16px rgba(132,204,22,0.30)',
    pink:    '0 4px 16px rgba(244,63,94,0.25)',
    amber:   '0 4px 16px rgba(245,158,11,0.25)',
    nav:     '0 -4px 24px rgba(70,72,212,0.09)',
  },
}
