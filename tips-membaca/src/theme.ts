// Minda Optima palette — navy, yellow, white; orange/red/green only as small accents.
export const C = {
  navy: '#0B1F4F',
  navyDeep: '#050F2C',
  navyMid: '#14327A',
  blue: '#2F62D8',
  sky: '#8FB6FF',
  yellow: '#FFD23F',
  yellowDeep: '#E8A300',
  yellowDark: '#9C6A00',
  white: '#FFFFFF',
  paper: '#F6F3EA',
  orange: '#FF8A1F',
  red: '#E5484D',
  green: '#26B36B',
  skin: '#F1C29E',
  skinShade: '#D99A72',
  ink: '#1A1F36',
};

const EMOJI = '"Noto Color Emoji"';
export const F = {
  display: `Baloo, ${EMOJI}, sans-serif`,
  sans: `Poppins, ${EMOJI}, sans-serif`,
  hand: `Caveat, ${EMOJI}, cursive`,
};

/** Layout zones on the 1080×1920 frame (keeps headline, visuals and subtitles apart). */
export const Z = {
  headY: 400, // centre of the 3D headline band (230–570)
  stageTop: 580,
  stageBottom: 1330,
  subY: 1450, // subtitle band (1380–1520), above the TikTok caption area
};
