/* =========================================================================
   WoodTools · Fixture Mundial 2026
   data.js  ·  Datos compartidos del torneo + utilidades
   ---------------------------------------------------------------------------
   Este archivo lo usan TANTO fixture.js COMO predictor.js para no duplicar
   las 48 selecciones y los 104 partidos en dos lugares distintos.
   ========================================================================= */

var WT = (function () {
  'use strict';

  /* ----------------------------------------------------------------------
     1) FASE DE GRUPOS
     Cada grupo: letra, 4 selecciones y 6 partidos (fecha 1, 2 y 3).
     ---------------------------------------------------------------------- */
  const GROUPS = [
    {
      id: 'A',
      teams: ['México', 'Sudáfrica', 'Corea del Sur', 'Rep. Checa'],
      matches: [
        { fecha: 1, date: 'Jue 11/06', time: '16:00', home: 'México',         away: 'Sudáfrica' },
        { fecha: 1, date: 'Jue 11/06', time: '23:00', home: 'Corea del Sur',  away: 'Rep. Checa' },
        { fecha: 2, date: 'Jue 18/06', time: '13:00', home: 'Rep. Checa',     away: 'Sudáfrica' },
        { fecha: 2, date: 'Jue 18/06', time: '22:00', home: 'México',         away: 'Corea del Sur' },
        { fecha: 3, date: 'Mié 24/06', time: '22:00', home: 'Sudáfrica',      away: 'Corea del Sur' },
        { fecha: 3, date: 'Mié 24/06', time: '22:00', home: 'Rep. Checa',     away: 'México' }
      ]
    },
    {
      id: 'B',
      teams: ['Canadá', 'Bosnia y Herz.', 'Qatar', 'Suiza'],
      matches: [
        { fecha: 1, date: 'Vie 12/06', time: '16:00', home: 'Canadá',         away: 'Bosnia y Herz.' },
        { fecha: 1, date: 'Sáb 13/06', time: '16:00', home: 'Qatar',          away: 'Suiza' },
        { fecha: 2, date: 'Jue 18/06', time: '16:00', home: 'Suiza',          away: 'Bosnia y Herz.' },
        { fecha: 2, date: 'Jue 18/06', time: '19:00', home: 'Canadá',         away: 'Qatar' },
        { fecha: 3, date: 'Mié 24/06', time: '16:00', home: 'Suiza',          away: 'Canadá' },
        { fecha: 3, date: 'Mié 24/06', time: '16:00', home: 'Bosnia y Herz.', away: 'Qatar' }
      ]
    },
    {
      id: 'C',
      teams: ['Brasil', 'Marruecos', 'Haití', 'Escocia'],
      matches: [
        { fecha: 1, date: 'Sáb 13/06', time: '19:00', home: 'Brasil',        away: 'Marruecos' },
        { fecha: 1, date: 'Sáb 13/06', time: '22:00', home: 'Haití',         away: 'Escocia' },
        { fecha: 2, date: 'Vie 19/06', time: '19:00', home: 'Escocia',       away: 'Marruecos' },
        { fecha: 2, date: 'Vie 19/06', time: '21:30', home: 'Brasil',        away: 'Haití' },
        { fecha: 3, date: 'Mié 24/06', time: '19:00', home: 'Escocia',       away: 'Brasil' },
        { fecha: 3, date: 'Mié 24/06', time: '19:00', home: 'Marruecos',     away: 'Haití' }
      ]
    },
    {
      id: 'D',
      teams: ['Estados Unidos', 'Paraguay', 'Australia', 'Turquía'],
      matches: [
        { fecha: 1, date: 'Vie 12/06', time: '22:00', home: 'Estados Unidos', away: 'Paraguay' },
        { fecha: 1, date: 'Dom 14/06', time: '01:00', home: 'Australia',      away: 'Turquía' },
        { fecha: 2, date: 'Vie 19/06', time: '16:00', home: 'Estados Unidos', away: 'Australia' },
        { fecha: 2, date: 'Sáb 20/06', time: '00:00', home: 'Turquía',        away: 'Paraguay' },
        { fecha: 3, date: 'Jue 25/06', time: '23:00', home: 'Paraguay',       away: 'Australia' },
        { fecha: 3, date: 'Jue 25/06', time: '23:00', home: 'Turquía',        away: 'Estados Unidos' }
      ]
    },
    {
      id: 'E',
      teams: ['Alemania', 'Curazao', 'Costa de Marfil', 'Ecuador'],
      matches: [
        { fecha: 1, date: 'Dom 14/06', time: '14:00', home: 'Alemania',        away: 'Curazao' },
        { fecha: 1, date: 'Dom 14/06', time: '20:00', home: 'Costa de Marfil', away: 'Ecuador' },
        { fecha: 2, date: 'Sáb 20/06', time: '17:00', home: 'Alemania',        away: 'Costa de Marfil' },
        { fecha: 2, date: 'Sáb 20/06', time: '21:00', home: 'Ecuador',         away: 'Curazao' },
        { fecha: 3, date: 'Jue 25/06', time: '17:00', home: 'Ecuador',         away: 'Alemania' },
        { fecha: 3, date: 'Jue 25/06', time: '17:00', home: 'Curazao',         away: 'Costa de Marfil' }
      ]
    },
    {
      id: 'F',
      teams: ['Países Bajos', 'Japón', 'Suecia', 'Túnez'],
      matches: [
        { fecha: 1, date: 'Dom 14/06', time: '17:00', home: 'Países Bajos', away: 'Japón' },
        { fecha: 1, date: 'Dom 14/06', time: '23:00', home: 'Suecia',       away: 'Túnez' },
        { fecha: 2, date: 'Sáb 20/06', time: '14:00', home: 'Países Bajos', away: 'Suecia' },
        { fecha: 2, date: 'Dom 21/06', time: '01:00', home: 'Túnez',        away: 'Japón' },
        { fecha: 3, date: 'Jue 25/06', time: '20:00', home: 'Japón',        away: 'Suecia' },
        { fecha: 3, date: 'Jue 25/06', time: '20:00', home: 'Túnez',        away: 'Países Bajos' }
      ]
    },
    {
      id: 'G',
      teams: ['Bélgica', 'Egipto', 'Irán', 'Nueva Zelanda'],
      matches: [
        { fecha: 1, date: 'Lun 15/06', time: '16:00', home: 'Bélgica',       away: 'Egipto' },
        { fecha: 1, date: 'Lun 15/06', time: '22:00', home: 'Irán',          away: 'Nueva Zelanda' },
        { fecha: 2, date: 'Dom 21/06', time: '16:00', home: 'Bélgica',       away: 'Irán' },
        { fecha: 2, date: 'Dom 21/06', time: '22:00', home: 'Nueva Zelanda', away: 'Egipto' },
        { fecha: 3, date: 'Sáb 27/06', time: '00:00', home: 'Egipto',        away: 'Irán' },
        { fecha: 3, date: 'Sáb 27/06', time: '00:00', home: 'Nueva Zelanda', away: 'Bélgica' }
      ]
    },
    {
      id: 'H',
      teams: ['España', 'Cabo Verde', 'Arabia Saudita', 'Uruguay'],
      matches: [
        { fecha: 1, date: 'Lun 15/06', time: '13:00', home: 'España',         away: 'Cabo Verde' },
        { fecha: 1, date: 'Lun 15/06', time: '19:00', home: 'Arabia Saudita', away: 'Uruguay' },
        { fecha: 2, date: 'Dom 21/06', time: '13:00', home: 'España',         away: 'Arabia Saudita' },
        { fecha: 2, date: 'Dom 21/06', time: '19:00', home: 'Uruguay',        away: 'Cabo Verde' },
        { fecha: 3, date: 'Vie 26/06', time: '21:00', home: 'Uruguay',        away: 'España' },
        { fecha: 3, date: 'Vie 26/06', time: '21:00', home: 'Cabo Verde',     away: 'Arabia Saudita' }
      ]
    },
    {
      id: 'I',
      teams: ['Francia', 'Senegal', 'Irak', 'Noruega'],
      matches: [
        { fecha: 1, date: 'Mar 16/06', time: '16:00', home: 'Francia', away: 'Senegal' },
        { fecha: 1, date: 'Mar 16/06', time: '19:00', home: 'Irak',    away: 'Noruega' },
        { fecha: 2, date: 'Lun 22/06', time: '18:00', home: 'Francia', away: 'Irak' },
        { fecha: 2, date: 'Lun 22/06', time: '21:00', home: 'Noruega', away: 'Senegal' },
        { fecha: 3, date: 'Vie 26/06', time: '16:00', home: 'Noruega', away: 'Francia' },
        { fecha: 3, date: 'Vie 26/06', time: '16:00', home: 'Senegal', away: 'Irak' }
      ]
    },
    {
      id: 'J',
      teams: ['Argentina', 'Argelia', 'Austria', 'Jordania'],
      matches: [
        { fecha: 1, date: 'Mar 16/06', time: '22:00', home: 'Argentina', away: 'Argelia' },
        { fecha: 1, date: 'Mié 17/06', time: '01:00', home: 'Austria',   away: 'Jordania' },
        { fecha: 2, date: 'Lun 22/06', time: '14:00', home: 'Argentina', away: 'Austria' },
        { fecha: 2, date: 'Mar 23/06', time: '00:00', home: 'Jordania',  away: 'Argelia' },
        { fecha: 3, date: 'Sáb 27/06', time: '23:00', home: 'Argelia',   away: 'Austria' },
        { fecha: 3, date: 'Sáb 27/06', time: '23:00', home: 'Jordania',  away: 'Argentina' }
      ]
    },
    {
      id: 'K',
      teams: ['Portugal', 'RD Congo', 'Uzbekistán', 'Colombia'],
      matches: [
        { fecha: 1, date: 'Mié 17/06', time: '14:00', home: 'Portugal',   away: 'RD Congo' },
        { fecha: 1, date: 'Mié 17/06', time: '23:00', home: 'Uzbekistán', away: 'Colombia' },
        { fecha: 2, date: 'Mar 23/06', time: '14:00', home: 'Portugal',   away: 'Uzbekistán' },
        { fecha: 2, date: 'Mar 23/06', time: '23:00', home: 'Colombia',   away: 'RD Congo' },
        { fecha: 3, date: 'Sáb 27/06', time: '20:30', home: 'Colombia',   away: 'Portugal' },
        { fecha: 3, date: 'Sáb 27/06', time: '20:30', home: 'RD Congo',   away: 'Uzbekistán' }
      ]
    },
    {
      id: 'L',
      teams: ['Inglaterra', 'Croacia', 'Ghana', 'Panamá'],
      matches: [
        { fecha: 1, date: 'Mié 17/06', time: '17:00', home: 'Inglaterra', away: 'Croacia' },
        { fecha: 1, date: 'Mié 17/06', time: '20:00', home: 'Ghana',      away: 'Panamá' },
        { fecha: 2, date: 'Mar 23/06', time: '17:00', home: 'Inglaterra', away: 'Ghana' },
        { fecha: 2, date: 'Mar 23/06', time: '20:00', home: 'Panamá',     away: 'Croacia' },
        { fecha: 3, date: 'Sáb 27/06', time: '18:00', home: 'Croacia',    away: 'Ghana' },
        { fecha: 3, date: 'Sáb 27/06', time: '18:00', home: 'Panamá',     away: 'Inglaterra' }
      ]
    }
  ];

  /* ----------------------------------------------------------------------
     2) DIECISEISAVOS DE FINAL (32 clasificados · 16 partidos)
     Las referencias 1A/2B = 1º/2º de grupo; "3 A/B/C/D" = mejor 3º
     proveniente de alguno de esos grupos.
     ---------------------------------------------------------------------- */
  const R32 = [
    { n: 73, date: 'Dom 28/06', time: '16:00', home: '2A', away: '2B' },
    { n: 74, date: 'Lun 29/06', time: '17:30', home: '1C', away: '2F' },
    { n: 75, date: 'Lun 29/06', time: '22:00', home: '1E', away: '3 A/B/C/D' },
    { n: 76, date: 'Lun 29/06', time: '14:00', home: '1F', away: '2C' },
    { n: 77, date: 'Mar 30/06', time: '18:00', home: '2E', away: '2I' },
    { n: 78, date: 'Mar 30/06', time: '14:00', home: '1I', away: '3 C/D/F/G' },
    { n: 79, date: 'Mar 30/06', time: '22:00', home: '1A', away: '3 C/E/F/H/I' },
    { n: 80, date: 'Mié 01/07', time: '',      home: '1L', away: '3 E/H/I/J/K' },
    { n: 81, date: 'Mié 01/07', time: '13:00', home: '1G', away: '3 A/E/H/I' },
    { n: 82, date: 'Mié 01/07', time: '17:00', home: '1D', away: '3 B/E/F/I/J' },
    { n: 83, date: 'Jue 02/07', time: '20:00', home: '1H', away: '2J' },
    { n: 84, date: 'Jue 02/07', time: '16:00', home: '2K', away: '2L' },
    { n: 85, date: 'Vie 03/07', time: '00:00', home: '1B', away: '3 E/F/G/I/J' },
    { n: 86, date: 'Vie 03/07', time: '19:00', home: '2D', away: '2G' },
    { n: 87, date: 'Jue 02/07', time: '22:30', home: '1J', away: '2H' },
    { n: 88, date: 'Vie 03/07', time: '16:00', home: '1K', away: '3 D/E/I/J/L' }
  ];

  /* OCTAVOS DE FINAL (8 partidos) */
  const R16 = [
    { n: 89, date: 'Sáb 04/07', time: '18:00', home: 'Gan. 74', away: 'Gan. 77' },
    { n: 90, date: 'Sáb 04/07', time: '14:00', home: 'Gan. 73', away: 'Gan. 75' },
    { n: 91, date: 'Dom 05/07', time: '17:00', home: 'Gan. 76', away: 'Gan. 78' },
    { n: 92, date: 'Dom 05/07', time: '21:00', home: 'Gan. 79', away: 'Gan. 80' },
    { n: 93, date: 'Lun 06/07', time: '16:00', home: 'Gan. 83', away: 'Gan. 84' },
    { n: 94, date: 'Lun 06/07', time: '21:00', home: 'Gan. 81', away: 'Gan. 82' },
    { n: 95, date: 'Mar 07/07', time: '13:00', home: 'Gan. 86', away: 'Gan. 88' },
    { n: 96, date: 'Mar 07/07', time: '16:00', home: 'Gan. 85', away: 'Gan. 87' }
  ];

  /* CUARTOS DE FINAL (4 partidos) */
  const QF = [
    { n: 97,  date: 'Jue 09/07', time: '17:00', home: 'Gan. 89', away: 'Gan. 90' },
    { n: 98,  date: 'Vie 10/07', time: '16:00', home: 'Gan. 93', away: 'Gan. 94' },
    { n: 99,  date: 'Sáb 11/07', time: '18:00', home: 'Gan. 91', away: 'Gan. 92' },
    { n: 100, date: 'Sáb 11/07', time: '22:00', home: 'Gan. 95', away: 'Gan. 96' }
  ];

  /* SEMIFINALES (2 partidos) */
  const SF = [
    { n: 101, date: 'Mar 14/07', time: '16:00', home: 'Gan. 97', away: 'Gan. 98' },
    { n: 102, date: 'Mié 15/07', time: '16:00', home: 'Gan. 99', away: 'Gan. 100' }
  ];

  /* TERCER Y CUARTO PUESTO */
  const THIRD = { n: 'TP', date: 'Sáb 18/07', time: '18:00', home: 'Perd. 101', away: 'Perd. 102' };

  /* GRAN FINAL */
  const FINAL = {
    n: 'F',
    date: 'Domingo 19 de julio',
    time: '16:00',
    venue: 'MetLife Stadium · Nueva York / Nueva Jersey',
    home: 'Gan. 101',
    away: 'Gan. 102'
  };

  /* ----------------------------------------------------------------------
     3) UTILIDADES
     ---------------------------------------------------------------------- */

  // Convierte "Costa de Marfil" -> "costa-de-marfil" (para nombres de archivo).
  function slug(name) {
    return String(name)
      .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos / ñ -> n
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Ruta de la bandera de una selección dentro de /imagenes/banderas.
  function flagSrc(name) {
    return 'imagenes/banderas/' + slug(name) + '.png';
  }

  // Conjunto con todos los nombres de selección (para validar texto escrito).
  const ALL_TEAMS = (function () {
    const s = {};
    GROUPS.forEach(g => g.teams.forEach(t => { s[slug(t)] = t; }));
    return s;
  })();

  // Devuelve el nombre "oficial" si el texto coincide con una selección.
  function matchTeam(text) {
    if (!text) return null;
    return ALL_TEAMS[slug(text)] || null;
  }

  // HTML de una "ficha" de selección: bandera + nombre.
  // side: 'home' (bandera hacia el centro, nombre a la izquierda) |
  //       'away' (bandera hacia el centro, nombre a la derecha).
  // El orden se define en el marcado (no con flex-direction) para que la
  // alineación funcione bien aunque la ficha quede anidada.
  function teamChip(name, side) {
    const s = side || 'home';
    const safe = name == null ? '' : String(name);
    const flag = safe
      ? '<span class="flag"><img src="' + flagSrc(safe) + '" alt="' + safe + '" loading="lazy"></span>'
      : '<span class="flag flag--empty"></span>';
    const nm = '<span class="tname' + (safe ? '' : ' tname--empty') + '">' + (safe || '—') + '</span>';
    const inner = s === 'home' ? (nm + flag) : (flag + nm);
    return '<span class="team team--' + s + '">' + inner + '</span>';
  }

  // Lista de cajas de marcador VISIBLES (ignora pestañas ocultas y penales apagados).
  function visibleScoreBoxes() {
    return Array.prototype.slice.call(document.querySelectorAll('.score-box'))
      .filter(n => n.offsetParent !== null);
  }

  // Crea un <input> de marcador: texto, SOLO números, sin flechitas.
  // opts: { value, onChange(value), cls, max }
  function numInput(opts) {
    opts = opts || {};
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.inputMode = 'numeric';
    inp.autocomplete = 'off';
    inp.setAttribute('maxlength', String(opts.max || 2));
    inp.className = opts.cls || 'score-box';
    inp.setAttribute('aria-label', 'goles');
    if (opts.value != null) inp.value = opts.value;
    // bloquea teclear cualquier cosa que no sea dígito
    inp.addEventListener('keypress', e => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
    // limpia (también ante pegado) y notifica
    inp.addEventListener('input', () => {
      const clean = inp.value.replace(/[^0-9]/g, '').slice(0, opts.max || 2);
      if (inp.value !== clean) inp.value = clean;
      if (opts.onChange) opts.onChange(inp.value);
    });
    // Navegación con teclado.
    inp.addEventListener('keydown', e => {
      const k = e.key;

      // Enter y →/←: recorrido secuencial por las cajas (orden del documento).
      if (k === 'Enter' || k === 'ArrowRight' || k === 'ArrowLeft') {
        // con las flechas, dejá primero que el cursor se mueva dentro del texto;
        // solo saltamos de caja cuando el cursor está en el borde.
        if (k === 'ArrowRight' && !(inp.selectionStart === inp.value.length && inp.selectionStart === inp.selectionEnd)) return;
        if (k === 'ArrowLeft'  && !(inp.selectionStart === 0 && inp.selectionEnd === 0)) return;
        const dir = (k === 'ArrowLeft') ? -1 : 1;
        const list = visibleScoreBoxes();
        const i = list.indexOf(inp);
        if (i === -1) return;
        const next = list[i + dir];
        if (next) { e.preventDefault(); next.focus(); next.select(); }
        else if (k === 'Enter') { e.preventDefault(); inp.blur(); }
        return;
      }

      // ↑/↓: se mueven a la caja de arriba / abajo según la posición en pantalla.
      if (k === 'ArrowDown' || k === 'ArrowUp') {
        const down = (k === 'ArrowDown');
        const r = inp.getBoundingClientRect();
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        let best = null, bestCost = Infinity;
        visibleScoreBoxes().forEach(n => {
          if (n === inp) return;
          const rr = n.getBoundingClientRect();
          const nx = rr.left + rr.width / 2, ny = rr.top + rr.height / 2;
          const dy = ny - cy;
          if (down ? dy <= 3 : dy >= -3) return;           // tiene que estar debajo / encima
          const cost = Math.abs(nx - cx) * 3 + Math.abs(dy); // priorizá la misma columna
          if (cost < bestCost) { bestCost = cost; best = n; }
        });
        if (best) { e.preventDefault(); best.focus(); best.select(); }
      }
    });
    return inp;
  }

  // Interpreta una referencia de cruce.
  //   "1A"            -> { type:'pos', pos:1, group:'A' }
  //   "3 A/B/C/D"     -> { type:'third', groups:['A','B','C','D'] }
  //   "Gan. 73"       -> { type:'win', match:73 }
  //   "Perd. 101"     -> { type:'lose', match:101 }
  function parseRef(ref) {
    const r = String(ref).trim();
    let m;
    if ((m = r.match(/^([123])([A-L])$/)))      return { type: 'pos', pos: +m[1], group: m[2] };
    if ((m = r.match(/^3\s+(.+)$/)))            return { type: 'third', groups: m[1].split('/').map(s => s.trim()) };
    if ((m = r.match(/^Gan\.?\s*(\d+)$/i)))     return { type: 'win', match: +m[1] };
    if ((m = r.match(/^Perd\.?\s*(\d+)$/i)))    return { type: 'lose', match: +m[1] };
    return { type: 'fixed', value: r };
  }

  /* ----------------------------------------------------------------------
     4) Placeholder visual cuando una imagen todavía no existe.
     Al fallar la carga, marcamos el <img> para que el CSS muestre un
     recuadro neutro en lugar del ícono roto del navegador.
     ---------------------------------------------------------------------- */
  if (typeof document !== 'undefined') {
    document.addEventListener('error', function (e) {
      const t = e.target;
      if (t && t.tagName === 'IMG') t.classList.add('img-missing');
    }, true);
  }

  return {
    GROUPS, R32, R16, QF, SF, THIRD, FINAL,
    slug, flagSrc, teamChip, parseRef, matchTeam, ALL_TEAMS, numInput
  };
})();

// Isomorfo: navegador (window.WT) y Node (require) sin duplicar datos.
if (typeof window !== 'undefined') window.WT = WT;
if (typeof module !== 'undefined' && module.exports) module.exports = WT;
