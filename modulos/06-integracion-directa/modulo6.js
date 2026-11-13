/**
 * modulo6.js — Integración directa.
 * Presets del taller; usa el componente compartido Antiderivada.
 */
(function () {
  // Pares f(x) / F(x) del taller (sintaxis math.js; "log" es el logaritmo natural)
  const PRESETS = [
    { txt: '∫ x² dx',                       f: 'x^2',                    F: 'x^3/3',                           fT: 'x^2',                              FT: '\\frac{x^3}{3}',                               r: [-3, 3] },
    { txt: '∫ (3/x² − 9/√x) dx',            f: '3/x^2-9/sqrt(x)',        F: '-3/x-18*sqrt(x)',                 fT: '\\frac{3}{x^2}-\\frac{9}{\\sqrt{x}}', FT: '-\\frac{3}{x}-18\\sqrt{x}',                  r: [0.3, 4] },
    { txt: '∫ (x − 1)(x + 1) dx',           f: '(x-1)*(x+1)',            F: 'x^3/3-x',                         fT: '(x-1)(x+1)',                       FT: '\\frac{x^3}{3}-x',                             r: [-3, 3] },
    { txt: '∫ (x + 4√x − 4/x) dx',          f: 'x+4*sqrt(x)-4/x',        F: 'x^2/2+8/3*x^(3/2)-4*log(x)',      fT: 'x+4\\sqrt{x}-\\frac{4}{x}',        FT: '\\frac{x^2}{2}+\\frac{8}{3}x^{3/2}-4\\ln|x|',  r: [0.3, 4] },
    { txt: '∫ (x − 1 − 1/x) dx',            f: 'x-1-1/x',                F: 'x^2/2-x-log(x)',                  fT: 'x-1-\\frac{1}{x}',                 FT: '\\frac{x^2}{2}-x-\\ln|x|',                     r: [0.3, 4] }
  ];

  // La lógica (gráfica, constante C y verificación) vive en assets/js/antiderivada.js
  Antiderivada({ contenedor: 'viz6', presets: PRESETS.map((p) => Object.assign({ y: [-15, 15] }, p)) });
})();
