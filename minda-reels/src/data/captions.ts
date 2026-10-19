/**
 * Subtitles, chunked by speech rhythm (3–6 words, max 2 lines).
 *  *WORD*  = keyword → turns yellow + pops when spoken
 *  " / "   = manual line break
 *  words   = optional onset time (s) for every word; otherwise spread evenly
 *  style   = 'skit' (yellow keyword) | 'host' (yellow highlighter keyword)
 * Timings were read off the original edit's word-by-word captions.
 */
export type Caption = {start: number; end: number; text: string; words?: number[]; style?: 'skit' | 'host'};

export const captions: Caption[] = [
  {start: 0.36, end: 0.82, text: '*ADIK!*', words: [0.4]},
  {start: 0.88, end: 2.12, text: 'Ya ibu…', words: [0.9, 1.3]},
  {start: 2.12, end: 3.42, text: 'jom ikut ibu *BACA*', words: [2.2, 2.6, 2.9, 3.2]},
  {start: 3.58, end: 4.45, text: 'Hmm…', words: [3.6]},
  {start: 4.66, end: 5.82, text: 'Yalah… *BOLEHLAH*', words: [4.7, 5.3]},
  {start: 5.88, end: 7.22, text: 'Tapi *KEJAP* *JE* / kan ibu?', words: [5.9, 6.2, 6.6, 6.8, 7.1]},
  {start: 7.48, end: 8.75, text: 'Iya, *SEKEJAP* saja', words: [7.5, 7.8, 8.3]},
  {start: 9.88, end: 10.6, text: 'Adik nak baca…', words: [9.9, 10.3, 10.4]},
  {start: 10.6, end: 11.78, text: '*2* *BARIS* je, boleh?', words: [10.6, 10.8, 11.3, 11.5]},
  {start: 11.88, end: 12.66, text: '*AMBOI*…', words: [11.9]},
  {start: 12.66, end: 13.78, text: 'ya ya yalah', words: [12.7, 12.9, 13.3]},
  {start: 13.8, end: 15.02, text: 'Lepas tu kita / *SAMBUNG* lagi, tahu', words: [13.8, 13.9, 14.1, 14.2, 14.5, 14.8]},
  {start: 15.38, end: 17.28, text: 'Okey, baca ni…', words: [15.4, 16.3, 16.6]},
  {start: 17.28, end: 18.2, text: 'emm… *"BA"*', words: [17.3, 17.45]},
  // 18.30–19.84: the speech bubble carries "Adik dah penatlah ibu"
  {start: 19.98, end: 21.32, text: 'Ya, kita *REHAT* sekejap', words: [20.0, 20.5, 20.7, 21.1]},
  {start: 21.48, end: 22.46, text: 'Lepas tu kita / sambung lagi', words: [21.5, 21.7, 21.8, 22.0, 22.3]},
  {start: 22.46, end: 23.42, text: '*5* *MINIT*, tahu?', words: [22.5, 22.7, 23.1]},
  {start: 23.42, end: 24.38, text: 'Boleh? *OKEY!*', words: [23.5, 24.1]},

  {start: 24.86, end: 25.86, text: 'Kadang ibu ayah', style: 'host'},
  {start: 25.86, end: 26.88, text: 'perlu *PUJUK* *DIA* sikit je', words: [25.88, 26.05, 26.25, 26.45, 26.6], style: 'host'},
  {start: 26.9, end: 28.1, text: 'Bila kita dah *PUJUK*', words: [26.95, 27.15, 27.35, 27.55], style: 'host'},
  {start: 28.38, end: 29.5, text: 'Dia mula rasa *SELESA*', words: [28.4, 28.6, 28.8, 29.0], style: 'host'},
  {start: 29.78, end: 30.5, text: 'Nanti lagi *MUDAH*', words: [29.8, 30.0, 30.15], style: 'host'},
  {start: 30.5, end: 31.32, text: 'dia nak mula *BACA*', words: [30.52, 30.65, 30.8, 30.98], style: 'host'},
  {start: 31.38, end: 32.55, text: 'Itu cara dia nak mula', style: 'host'},
  {start: 32.55, end: 33.98, text: 'bina *CONFIDENT*', words: [32.6, 32.85], style: 'host'},
];
