// Minda Optima brand palette: navy + yellow + white, orange/red only for emphasis.
export const C = {
  navy: '#0D1F4F',
  navyDeep: '#081436',
  navySoft: '#1C3A86',
  yellow: '#FFD23F',
  yellowDeep: '#F5B400',
  white: '#FFFFFF',
  orange: '#FF7A1A',
  red: '#E8443A',
  ink: '#0A1530',
};

const EMOJI = '"Noto Color Emoji", "Apple Color Emoji"';
export const F = {
  display: `Baloo, ${EMOJI}, sans-serif`,
  sans: `Poppins, ${EMOJI}, sans-serif`,
  hand: `Caveat, ${EMOJI}, cursive`,
  emoji: EMOJI,
};

// Heavy outline used for text that sits directly on footage.
export const outline = (w = 10, color = C.navy) => ({
  WebkitTextStroke: `${w}px ${color}`,
  paintOrder: 'stroke fill' as const,
});

export const dropShadow = '0 10px 24px rgba(8, 20, 54, 0.35)';
