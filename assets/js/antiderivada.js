/**
 * antiderivada.js
 * Componente reutilizable (módulos 6 a 14): muestra f(x) y su antiderivada F(x)+C
 * (C ajustable) y anima la "verificación por derivación".
 *
 * Uso: Antiderivada({ contenedor: 'viz', presets: [
 *   { txt, f, F, fT, FT, r: [x0, x1], y: [ymin, ymax] (opcional) } ] })
 *   f, F: sintaxis math.js ("log" es el logaritmo natural) · fT, FT: LaTeX · r: rango de x
 */
function Antiderivada(cfg) {
  const id = cfg.contenedor, P = cfg.presets;
  const raiz = document.getElementById(id);
  const q = (s) => document.getElementById(`${id}-${s}`);
  raiz.innerHTML = `
    <div class="controles">
      <div class="campo"><label for="${id}-p">Integral</label>
        <select id="${id}-p">${P.map((p, i) => `<option value="${i}">${p.txt}</option>`).join('')}</select></div>
      <div class="campo"><label for="${id}-c">Constante C = <b id="${id}-cv">0</b></label>
        <input id="${id}-c" type="range" min="-5" max="5" step="0.1" value="0"></div>
      <div class="campo"><label>&nbsp;</label><button type="button" class="btn" id="${id}-ver">Verificar por derivación</button></div>
    </div>
    <div class="caja formula" id="${id}-formula"></div>
    <div class="caja"><div id="${id}-graf" class="grafica" role="img" aria-label="Gráfica de f(x) y de su antiderivada F(x)"></div></div>
    <div class="caja" id="${id}-verif" aria-live="polite"><p>Pulsa «Verificar por derivación» para ver cómo la pendiente de F(x) coincide con f(x) punto por punto.</p></div>`;

  let animacion = null;
  const cur = () => P[q('p').value];

  /** Dibuja f, F+C y (opcional) la tangente a F en x0. */
  function dibujar(x0) {
    const p = cur(), C = parseFloat(q('c').value), c = Gfx.colores();
    q('cv').textContent = C;
    const f = Mat.parsear(p.f).f, F0 = Mat.parsear(p.F).f, F = (x) => F0(x) + C;
    Gfx.tex(`${id}-formula`, `\\int ${p.fT}\\,dx = ${p.FT} + C \\qquad\\text{y}\\qquad \\frac{d}{dx}\\left[F(x)+C\\right]=f(x)`, true);
    const [lo, hi] = p.r, N = 300;
    const xs = Array.from({ length: N + 1 }, (_, i) => lo + ((hi - lo) * i) / N);
    const lim = (y) => (Number.isFinite(y) && Math.abs(y) < 60 ? y : null);   // recorta asíntotas
    const tr = [
      { x: xs, y: xs.map((x) => lim(f(x))), mode: 'lines', name: 'f(x)', line: { color: c.curva, width: 3 } },
      { x: xs, y: xs.map((x) => lim(F(x))), mode: 'lines', name: `F(x) + C   (C = ${C})`, line: { color: c.rojo, width: 3 } }
    ];
    if (x0 !== undefined) {
      const m = f(x0), y0 = F(x0), d = (hi - lo) * 0.12;
      tr.push({ x: [x0 - d, x0 + d], y: [y0 - m * d, y0 + m * d], mode: 'lines', name: 'Tangente a F (pendiente = f(x₀))', line: { color: '#ff9f1c', width: 3, dash: 'dot' } });
      tr.push({ x: [x0], y: [y0], mode: 'markers', showlegend: false, marker: { size: 11, color: '#ff9f1c' } });
    }
    Gfx.dibujar(`${id}-graf`, tr, { yaxis: Object.assign({ gridcolor: c.rejilla, zerolinecolor: c.texto }, p.y ? { range: p.y } : {}) });
  }

  /** Anima x0 y compara la derivada numérica de F con f(x0). */
  function verificar() {
    clearInterval(animacion);
    const p = cur(), C = parseFloat(q('c').value);
    const f = Mat.parsear(p.f).f, F0 = Mat.parsear(p.F).f, F = (x) => F0(x) + C;
    const [lo, hi] = p.r, pasos = 40, h = 1e-5;
    let k = 0, peor = 0;
    animacion = setInterval(() => {
      const x0 = lo + ((hi - lo) * (k + 0.5)) / pasos;
      const dF = (F(x0 + h) - F(x0 - h)) / (2 * h), fx = f(x0);
      if (Number.isFinite(dF - fx)) peor = Math.max(peor, Math.abs(dF - fx) / Math.max(1, Math.abs(fx)));
      dibujar(x0);
      Gfx.tex(q('verif'), `x_0=${Gfx.num(x0, 3)}\\quad F'(x_0)\\approx\\frac{F(x_0+h)-F(x_0-h)}{2h}=${Gfx.num(dF, 5)}\\quad f(x_0)=${Gfx.num(fx, 5)}\\ \\checkmark`, true);
      if (++k >= pasos) {
        clearInterval(animacion);
        Gfx.tex(q('verif'), `\\text{Verificado: el error relativo máximo entre }F'(x)\\text{ y }f(x)\\text{ es }\\approx ${Gfx.num(peor, 8)}\\;\\Rightarrow\\; F'(x)=f(x)\\ \\checkmark`, true);
        dibujar();
      }
    }, 90);
  }

  q('p').addEventListener('change', () => { clearInterval(animacion); dibujar(); });
  q('c').addEventListener('input', () => { clearInterval(animacion); dibujar(); });
  q('ver').addEventListener('click', verificar);
  document.addEventListener('tema-cambiado', () => dibujar());
  dibujar();
}
