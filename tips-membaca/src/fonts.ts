import {continueRender, delayRender, staticFile} from 'remotion';

const FONTS = [
  {family: 'Baloo', file: 'fonts/baloo-2-latin-800-normal.woff2', weight: '800'},
  {family: 'Poppins', file: 'fonts/poppins-latin-600-normal.woff2', weight: '600'},
  {family: 'Poppins', file: 'fonts/poppins-latin-800-normal.woff2', weight: '800'},
  {family: 'Poppins', file: 'fonts/poppins-latin-900-normal.woff2', weight: '900'},
  {family: 'Caveat', file: 'fonts/caveat-latin-700-normal.woff2', weight: '700'},
];

let pending: Promise<void> | null = null;

// Blocks rendering until every brand font is ready so no frame renders with fallback fonts.
export const loadFonts = () => {
  if (pending) return;
  const handle = delayRender('Loading fonts');
  pending = Promise.all(
    FONTS.map(async (f) => {
      const face = new FontFace(f.family, `url(${staticFile(f.file)}) format('woff2')`, {weight: f.weight});
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(await face.load());
    }),
  )
    .then(() => continueRender(handle))
    .catch((err) => {
      console.error(err);
      continueRender(handle);
    });
};
