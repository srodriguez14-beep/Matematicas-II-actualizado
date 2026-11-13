/**
 * modulo15.js — Sólidos de revolución.
 * Gráfica 3D (Plotly surface) del sólido generado y cálculo del volumen con
 * los métodos de discos, arandelas (eje x) y capas cilíndricas (eje y).
 */
(function () {
  const PRE = [
    { txt: 'Discos: y = √x en [0, 4]',               modo: 'discos',    f: 'sqrt(x)',              g: '',    a: '0',  b: '4' },
    { txt: 'Discos: y = x² en [0, 1]',               modo: 'discos',    f: 'x^2',                  g: '',    a: '0',  b: '1' },
    { txt: 'Esfera: y = √(4 − x²) en [−2, 2]',       modo: 'discos',    f: 'sqrt(max(0,4-x^2))',   g: '',    a: '-2', b: '2' },
    { txt: 'Arandelas: entre y = x y y = x² en [0, 1]', modo: 'arandelas', f: 'x',                 g: 'x^2', a: '0',  b: '1' },
    { txt: 'Capas: y = x² en [0, 2] alrededor del eje y', modo: 'capas', f: 'x^2',                 g: '',    a: '0',  b: '2' }
  ];
  const raiz = document.getElementById('viz15');
  const q = (s) => document.getElementById('v15-' + s);
  raiz.innerHTML = `
    <div class="controles">
      <div class="campo"><label for="v15-pre">Ejemplos</label><select id="v15-pre">${PRE.map((p, i) => `<option value="${i}">${p.txt}</option>`).join('')}</select></div>
      <div class="campo"><label for="v15-modo">Método</label>
        <select id="v15-modo"><option value="discos">Discos (eje x)</option><option value="arandelas">Arandelas (eje x)</option><option value="capas">Capas cilíndricas (eje y)</option></select></div>
      <div class="campo"><label for="v15-f">f(x) =</label><input id="v15-f" type="text" spellcheck="false"></div>
      <div class="campo" id="v15-gc" hidden><label for="v15-g">g(x) (radio interior) =</label><input id="v15-g" type="text" spellcheck="false"></div>
    </div>
    <div class="controles">
      <div class="campo"><label for="v15-a">a</label><input id="v15-a" type="text" inputmode="decimal"></div>
      <div class="campo"><label for="v15-b">b</label><input id="v15-b" type="text" inputmode="decimal"></div>
      <div class="campo"><label for="v15-corte">Vista</label><select id="v15-corte"><option value="0">Sólido completo</option><option value="1">Con corte (ver el interior)</option></select></div>
      <div class="campo"><label>&nbsp;</label><button type="button" class="btn" id="v15-go">Graficar</button></div>
    </div>
    <div class="mensaje-error" id="v15-err" role="alert" hidden></div>
    <div class="caja"><div id="v15-3d" class="grafica" style="height:440px" role="img" aria-label="Sólido de revolución en 3D"></div></div>
    <h3>Región que gira</h3>
    <div class="caja"><div id="v15-reg" class="grafica" role="img" aria-label="Región plana que se hace girar"></div></div>
    <div class="resultados" id="v15-res" aria-live="polite"></div>`;

  const val = (t) => { try { return Number(math.evaluate(String(t).replace(/π/g, 'pi'))); } catch { return NaN; } };
  const fallo = (m) => { q('err').textContent = '⚠ ' + m; q('err').hidden = false; };

  function cargar(i) {
    const p = PRE[i];
    q('modo').value = p.modo; q('f').value = p.f; q('g').value = p.g; q('a').value = p.a; q('b').value = p.b;
    dibujar();
  }

  function dibujar() {
    const modo = q('modo').value;
    q('gc').hidden = modo !== 'arandelas';
    const pf = Mat.parsear(q('f').value), pg = modo === 'arandelas' ? Mat.parsear(q('g').value) : { f: null, error: null };
    const a = val(q('a').value), b = val(q('b').value);
    const msg = pf.error || pg.error || Mat.validar(a, b, 2, false)
      || (modo === 'capas' && a < 0 ? 'Para capas cilíndricas la región debe estar a la derecha del eje y (a ≥ 0).' : null);
    if (msg) return fallo(msg);
    const f = pf.f, g = pg.f;
    if (!Mat.funcionValida(f, a, b) || (g && !Mat.funcionValida(g, a, b))) return fallo('Alguna función no está definida en todo [a, b].');
    if (modo === 'arandelas' && Mat.nodos(a, b, 200).some((x) => f(x) < g(x) - 1e-9)) return fallo('En arandelas, f (radio exterior) debe ser mayor o igual que g (radio interior) en [a, b].');
    q('err').hidden = true;

    // ----- Superficie 3D -----
    const c = Gfx.colores(), NX = 60, NT = 48, tmax = q('corte').value === '1' ? 1.5 * Math.PI : 2 * Math.PI;
    const xs = Array.from({ length: NX + 1 }, (_, i) => a + ((b - a) * i) / NX);
    const ts = Array.from({ length: NT + 1 }, (_, j) => (tmax * j) / NT);
    const superficie = (r, col) => {
      const X = ts.map((t) => xs.map((x) => (modo === 'capas' ? x * Math.cos(t) : x)));
      const Y = ts.map((t) => xs.map((x) => (modo === 'capas' ? r(x) : r(x) * Math.cos(t))));
      const Z = ts.map((t) => xs.map((x) => (modo === 'capas' ? x * Math.sin(t) : r(x) * Math.sin(t))));
      return { type: 'surface', x: X, y: Y, z: Z, showscale: false, opacity: 0.95, colorscale: [[0, col[0]], [1, col[1]]] };
    };
    const tr3 = [superficie(f, ['#6b0000', '#ff3b30'])];
    if (modo === 'arandelas') tr3.push(superficie(g, ['#444444', '#bbbbbb']));
    Gfx.dibujar('v15-3d', tr3, { showlegend: false, margin: { l: 0, r: 0, t: 0, b: 0 },
      scene: { aspectmode: 'data', xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'z' } } });

    // ----- Región plana -----
    const X2 = Array.from({ length: 201 }, (_, i) => a + ((b - a) * i) / 200);
    const tr2 = [];
    if (modo === 'arandelas') {
      tr2.push({ x: X2, y: X2.map(g), mode: 'lines', line: { width: 0 }, showlegend: false, hoverinfo: 'skip' });
      tr2.push({ x: X2, y: X2.map(f), mode: 'lines', fill: 'tonexty', fillcolor: c.rojoRelleno, line: { color: c.rojo, width: 2 }, name: 'Región' });
      tr2.push({ x: X2, y: X2.map(g), mode: 'lines', line: { color: c.curva, width: 2 }, name: 'g(x)' });
    } else {
      tr2.push({ x: X2, y: X2.map(f), mode: 'lines', fill: 'tozeroy', fillcolor: c.rojoRelleno, line: { color: c.rojo, width: 2 }, name: 'f(x)' });
    }
    Gfx.dibujar('v15-reg', tr2);

    // ----- Volumen -----
    let V, formula;
    if (modo === 'discos') { V = Math.PI * Mat.simpson((x) => f(x) ** 2, a, b, 2000); formula = '\\pi\\int_a^b [f(x)]^2\\,dx'; }
    else if (modo === 'arandelas') { V = Math.PI * Mat.simpson((x) => f(x) ** 2 - g(x) ** 2, a, b, 2000); formula = '\\pi\\int_a^b \\left([f(x)]^2-[g(x)]^2\\right)dx'; }
    else { V = 2 * Math.PI * Mat.simpson((x) => x * f(x), a, b, 2000); formula = '2\\pi\\int_a^b x\\,f(x)\\,dx'; }
    const cont = q('res'); cont.innerHTML = '';
    const dato = (etq, tex) => { const d = document.createElement('div'); d.className = 'dato';
      d.innerHTML = `<small>${etq}</small><span></span>`; Gfx.tex(d.querySelector('span'), tex); cont.appendChild(d); };
    dato('Fórmula', `V=${formula}`);
    dato('Volumen', `V\\approx ${Gfx.num(V, 5)}\\ \\text{u}^3`);
    dato('Volumen / π', `V/\\pi\\approx ${Gfx.num(V / Math.PI, 5)}`);
  }

  q('pre').addEventListener('change', (e) => cargar(e.target.value));
  q('go').addEventListener('click', dibujar);
  q('modo').addEventListener('change', dibujar);
  q('corte').addEventListener('change', dibujar);
  ['f', 'g', 'a', 'b'].forEach((s) => q(s).addEventListener('change', dibujar));
  document.addEventListener('tema-cambiado', dibujar);
  cargar(0);
})();
