/* =========================================================================
   WoodTools · Fixture Mundial 2026
   fixture.js  ·  Página FIXTURE — versión para completar a mano.
   Goles de la fase de grupos + selecciones que clasifican escritas a mano.
   Todo se guarda en localStorage.
   ========================================================================= */
(function () {
  'use strict';

  const KEY = 'wt-fixture-v1';
  let store = {};
  try { store = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { store = {}; }
  const save = () => localStorage.setItem(KEY, JSON.stringify(store));

  /* --- mini helper para crear elementos --- */
  function el(tag, attrs, children) {
    const n = document.createElement(tag);
    if (attrs) for (const k in attrs) {
      if (k === 'class') n.className = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(c => n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return n;
  }

  // Crea un input persistente ligado a una clave de store.
  function field(id, attrs) {
    const inp = el('input', attrs);
    if (store[id] != null) inp.value = store[id];
    inp.addEventListener('input', () => {
      store[id] = inp.value;
      save();
      if (inp.dataset.flag) refreshFlag(inp);
    });
    return inp;
  }

  // Caja de marcador: solo números, sin flechitas (ver WT.numInput).
  function scoreInput(id) {
    return WT.numInput({ value: store[id], onChange: v => { store[id] = v; save(); } });
  }

  // Actualiza la banderita del clasificado escrito a mano.
  function refreshFlag(inp) {
    const wrap = inp.closest('.ko-team');
    if (!wrap) return;
    const img = wrap.querySelector('.flag img');
    if (!img) return;
    const team = WT.matchTeam(inp.value);
    if (team) { img.src = WT.flagSrc(team); img.classList.remove('img-missing'); img.style.opacity = ''; }
    else { img.removeAttribute('src'); img.style.opacity = '0'; }
  }

  /* =================== FASE DE GRUPOS =================== */
  function renderGroup(g) {
    const card = el('div', { class: 'group-card' });

    // Cabecera
    card.appendChild(el('div', { class: 'group-card__head' }, [
      el('span', { class: 'group-badge' }, [g.id]),
      el('div', {}, [ el('h3', { html: 'GRUPO ' + g.id + '<small>4 selecciones · 6 partidos</small>' }) ]),
      el('div', { class: 'group-logo', html: '<img src="imagenes/Logo.png" alt="WoodTools">' })
    ]));

    // Participantes
    const list = el('ul', { class: 'team-list' });
    g.teams.forEach(t => {
      list.appendChild(el('li', { html: WT.teamChip(t, 'away') }));
    });
    card.appendChild(list);

    // Partidos agrupados por fecha
    const wrap = el('div', { class: 'matches' });
    [1, 2, 3].forEach(f => {
      wrap.appendChild(el('div', { class: 'fecha-label' }, [f + '.ª FECHA']));
      g.matches.filter(m => m.fecha === f).forEach((m, i) => {
        const idx = g.matches.indexOf(m);
        const row = el('div', { class: 'match' });
        row.appendChild(el('div', { class: 'match__when' }, [m.date + (m.time ? ' · ' + m.time : '')]));
        row.appendChild(el('div', { class: 'team team--home', html: WT.teamChip(m.home, 'home') }));
        const sc = el('div', { class: 'score' });
        sc.appendChild(scoreInput('g-' + g.id + '-' + idx + '-h'));
        sc.appendChild(el('span', { class: 'dash' }, ['-']));
        sc.appendChild(scoreInput('g-' + g.id + '-' + idx + '-a'));
        row.appendChild(sc);
        row.appendChild(el('div', { class: 'team team--away', html: WT.teamChip(m.away, 'away') }));
        wrap.appendChild(row);
      });
    });
    card.appendChild(wrap);
    return card;
  }

  /* =================== LLAVES (texto a mano) =================== */
  // Un lado de la llave: referencia + banderita + input de texto + marcador.
  function koSide(matchN, who, ref) {
    const side = el('div', { class: 'ko-side' });
    const team = el('div', { class: 'ko-team' });
    team.appendChild(el('span', { class: 'ref-tag' }, [ref]));
    const flag = el('span', { class: 'flag' });
    const img = el('img', { alt: '' }); img.style.opacity = '0';
    flag.appendChild(img);
    team.appendChild(flag);
    const txt = field('m' + matchN + '-' + who + '-team',
      { type: 'text', class: 'ko-input', placeholder: 'Clasificado', 'data-flag': '1' });
    team.appendChild(txt);
    side.appendChild(team);
    const sc = el('div', { class: 'ko-score' });
    sc.appendChild(scoreInput('m' + matchN + '-' + who));
    side.appendChild(sc);
    // pinta la banderita si ya había algo guardado
    setTimeout(() => refreshFlag(txt), 0);
    return side;
  }

  function koCard(match) {
    const card = el('div', { class: 'ko-card' });
    card.appendChild(el('div', { class: 'ko-card__head' }, [
      el('span', { class: 'ko-num' }, ['#' + match.n]),
      el('span', { class: 'ko-when' }, [match.date + (match.time ? ' · ' + match.time : '')])
    ]));
    card.appendChild(koSide(match.n, 'home', match.home));
    card.appendChild(koSide(match.n, 'away', match.away));
    return card;
  }

  function renderRound(containerId, matches) {
    const c = document.getElementById(containerId);
    matches.forEach(m => c.appendChild(koCard(m)));
  }

  /* =================== FINAL =================== */
  function renderFinal() {
    const F = WT.FINAL;
    const wrap = document.getElementById('final-wrap');
    const card = el('div', { class: 'final-card' });
    card.appendChild(el('h3', {}, ['Gran Final']));
    card.appendChild(el('p', { class: 'final-meta' }, [F.date + ' · ' + F.time + ' · ' + F.venue]));

    const stage = el('div', { class: 'final-stage' });

    function finalist(who, ref) {
      const f = el('div', { class: 'finalist ko-team' });
      const flag = el('span', { class: 'flag' });
      const img = el('img', { alt: '' }); img.style.opacity = '0';
      flag.appendChild(img); f.appendChild(flag);
      f.appendChild(el('span', { class: 'ref-tag' }, [ref]));
      const txt = field('final-' + who + '-team',
        { type: 'text', class: 'ko-input', placeholder: 'Finalista', 'data-flag': '1' });
      f.appendChild(txt);
      // Resultado DEBAJO del nombre
      const fs = el('div', { class: 'finalist-score' });
      fs.appendChild(scoreInput('final-' + who));
      f.appendChild(fs);
      // Penales (debajo del resultado)
      const pen = el('div', { class: 'finalist-pen' });
      pen.appendChild(el('span', { class: 'pen-cap' }, ['Penales']));
      pen.appendChild(scoreInput('final-' + who + '-pen'));
      f.appendChild(pen);
      setTimeout(() => refreshFlag(txt), 0);
      return f;
    }

    stage.appendChild(finalist('home', F.home));

    // Hueco central para la imagen de la copa del mundo
    const slot = el('div', { class: 'trophy-slot' });
    const trophy = el('img', { src: 'imagenes/Copa-del-mundo.png', alt: 'Copa del Mundo' });
    slot.appendChild(trophy);
    slot.appendChild(el('span', { class: 'vs' }, ['VS']));
    stage.appendChild(slot);

    stage.appendChild(finalist('away', F.away));
    card.appendChild(stage);

    // Opción "Se define por penales"
    const toggle = el('label', { class: 'pen-toggle' });
    const chk = el('input', { type: 'checkbox' });
    if (store['final-pen'] === '1') { chk.checked = true; card.classList.add('show-pen'); }
    chk.addEventListener('change', () => {
      store['final-pen'] = chk.checked ? '1' : '';
      save();
      card.classList.toggle('show-pen', chk.checked);
    });
    toggle.appendChild(chk);
    toggle.appendChild(document.createTextNode('Se define por penales'));
    card.appendChild(toggle);

    // Campeón (a mano)
    const champ = el('div', { class: 'champion' });
    champ.appendChild(el('span', {}, ['¡ CAMPEÓN DEL MUNDO !']));
    const cn = field('champion', { type: 'text', class: 'ko-input champion-name', placeholder: 'Escribí el campeón' });
    cn.style.textAlign = 'center';
    champ.appendChild(cn);
    card.appendChild(champ);

    wrap.appendChild(card);
  }

  /* =================== NAVEGACIÓN POR PARTES =================== */
  function setupTabs() {
    const tabs = document.querySelectorAll('#tabs .tab-btn');
    const parts = document.querySelectorAll('.part');
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      const p = btn.dataset.part;
      parts.forEach(sec => sec.classList.toggle('active', sec.dataset.part === p));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  /* =================== RESET =================== */
  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('¿Borrar todos los resultados cargados en el fixture?')) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  });

  /* =================== INICIO =================== */
  WT.GROUPS.slice(0, 6).forEach(g => document.getElementById('groups-1').appendChild(renderGroup(g)));
  WT.GROUPS.slice(6).forEach(g => document.getElementById('groups-2').appendChild(renderGroup(g)));
  renderRound('round-r32', WT.R32);
  renderRound('round-r16', WT.R16);
  renderRound('round-qf', WT.QF);
  renderRound('round-sf', WT.SF);
  renderRound('round-third', [WT.THIRD]);
  renderFinal();
  setupTabs();
})();
