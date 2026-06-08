/* =========================================================================
   WoodTools · Fixture Mundial 2026
   predictor.js  ·  Página PREDICTOR — simulador del torneo.
   ========================================================================= */
(function () {
  'use strict';

  const KEY = 'wt-predictor-v1';
  const state = loadState();
  
  function loadState() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) {}
    return {
      gs:    s.gs    || {},   // goles de grupos          g-A-0-h / g-A-0-a
      ks:    s.ks    || {},   // goles de eliminatorias   m73-h / m73-a
      pen:   s.pen   || {},   // ganador por penales      m89 -> 'home'|'away'
      third: s.third || {},   // mapping automático:      '75-a' -> 'B'
      flags: s.flags || {},   // banderas varias           { finalPen: true }
      lastThirdsStr: s.lastThirdsStr || '' // guarda el set actual de 3.º
    };
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));

  /* --- helpers DOM --- */
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
  function num(v) { if (v === '' || v == null) return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
  function setFlag(img, team) {
    if (team) { img.src = WT.flagSrc(team); img.style.opacity = ''; img.classList.remove('img-missing'); }
    else { img.removeAttribute('src'); img.style.opacity = '0'; }
  }

  function scoreInput(map, id) {
    return WT.numInput({ value: map[id], onChange: v => { map[id] = v; save(); update(); } });
  }

  /* =====================================================================
     REGISTROS de DOM
     ===================================================================== */
  const groupReg = [];   
  const koReg = [];      
  let finalReg = null;   

  /* =====================================================================
     1) FASE DE GRUPOS
     ===================================================================== */
  function renderGroup(g) {
    const card = el('div', { class: 'group-card' });
    card.appendChild(el('div', { class: 'group-card__head' }, [
      el('span', { class: 'group-badge' }, [g.id]),
      el('div', {}, [ el('h3', { html: 'GRUPO ' + g.id + '<small>Tabla en vivo</small>' }) ])
    ]));

    const table = el('table', { class: 'standings' });
    table.appendChild(el('thead', { html:
      '<tr><th>#</th><th>Selección</th><th>PJ</th><th>DG</th><th>Pts</th></tr>' }));
    const tbody = el('tbody');
    table.appendChild(tbody);
    card.appendChild(table);
    groupReg.push({ g, tbody });

    const wrap = el('div', { class: 'matches' });
    [1, 2, 3].forEach(f => {
      wrap.appendChild(el('div', { class: 'fecha-label' }, [f + '.ª FECHA']));
      g.matches.forEach((m, idx) => {
        if (m.fecha !== f) return;
        const row = el('div', { class: 'match' });
        row.appendChild(el('div', { class: 'match__when' }, [m.date + (m.time ? ' · ' + m.time : '')]));
        row.appendChild(el('div', { class: 'team team--home', html: WT.teamChip(m.home, 'home') }));
        const sc = el('div', { class: 'score' });
        sc.appendChild(scoreInput(state.gs, 'g-' + g.id + '-' + idx + '-h'));
        sc.appendChild(el('span', { class: 'dash' }, ['-']));
        sc.appendChild(scoreInput(state.gs, 'g-' + g.id + '-' + idx + '-a'));
        row.appendChild(sc);
        row.appendChild(el('div', { class: 'team team--away', html: WT.teamChip(m.away, 'away') }));
        wrap.appendChild(row);
      });
    });
    card.appendChild(wrap);
    return card;
  }

  /* =====================================================================
     2) CÁLCULO DE TABLAS
     ===================================================================== */
  function computeStanding(g) {
    const stat = {};
    g.teams.forEach((t, i) => stat[t] = { team: t, idx: i, pj: 0, pts: 0, gf: 0, gc: 0 });
    g.matches.forEach((m, idx) => {
      const h = num(state.gs['g-' + g.id + '-' + idx + '-h']);
      const a = num(state.gs['g-' + g.id + '-' + idx + '-a']);
      if (h === null || a === null) return;
      const H = stat[m.home], A = stat[m.away];
      H.pj++; A.pj++; H.gf += h; H.gc += a; A.gf += a; A.gc += h;
      if (h > a) { H.pts += 3; } else if (a > h) { A.pts += 3; } else { H.pts++; A.pts++; }
    });
    return Object.values(stat)
      .map(s => (s.gd = s.gf - s.gc, s))
      .sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || x.idx - y.idx);
  }

  function computeThirds(standings) {
    const thirds = WT.GROUPS.map(g => {
      const s = standings[g.id][2];
      return { group: g.id, team: s.team, pts: s.pts, gd: s.gd, gf: s.gf };
    }).sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || (x.group < y.group ? -1 : 1));
    const qualified = thirds.slice(0, 8);
    return { all: thirds, qualified, groups: new Set(qualified.map(t => t.group)) };
  }

  function renderStandingRows(g, arr, thirds, tbody) {
    tbody.innerHTML = '';
    arr.forEach((s, i) => {
      const pos = i + 1;
      const tr = el('tr', { class: pos <= 3 ? 'q' + pos : '' });
      let tag = '';
      if (pos === 1) tag = '<span class="qtag qtag--1">1.º</span>';
      else if (pos === 2) tag = '<span class="qtag qtag--2">2.º</span>';
      else if (pos === 3) tag = thirds.groups.has(g.id)
        ? '<span class="qtag qtag--3 in">3.º ✓</span>'
        : '<span class="qtag qtag--3">3.º</span>';
      tr.appendChild(el('td', { class: 'pos' }, [String(pos)]));
      tr.appendChild(el('td', { html: WT.teamChip(s.team, 'away') + ' ' + tag }));
      tr.appendChild(el('td', {}, [String(s.pj)]));
      tr.appendChild(el('td', {}, [(s.gd > 0 ? '+' : '') + s.gd]));
      tr.appendChild(el('td', { class: 'pts' }, [String(s.pts)]));
      tbody.appendChild(tr);
    });
  }

  /* =====================================================================
     3) LLAVES (Sin selects, texto automático)
     ===================================================================== */
  function buildSide(match, who, ref) {
    const refInfo = WT.parseRef(ref);
    const isThird = refInfo.type === 'third';
    const side = el('div', { class: 'ko-side' });
    const team = el('div', { class: 'ko-team' });

    team.appendChild(el('span', { class: 'ref-tag' }, [ref]));
    const flag = el('span', { class: 'flag' });
    const img = el('img', { alt: '' }); img.style.opacity = '0';
    flag.appendChild(img); team.appendChild(flag);

    const nameEl = el('span', { class: 'tname tname--empty' }, ['—']);
    team.appendChild(nameEl);
    side.appendChild(team);

    const sc = el('div', { class: 'ko-score' });
    sc.appendChild(scoreInput(state.ks, 'm' + match.n + '-' + (who === 'home' ? 'h' : 'a')));
    side.appendChild(sc);

    return { who, ref, refInfo, isThird, n: match.n, sideEl: side, img, nameEl };
  }

  function buildKoCard(match) {
    const card = el('div', { class: 'ko-card' });
    card.appendChild(el('div', { class: 'ko-card__head' }, [
      el('span', { class: 'ko-num' }, ['#' + match.n]),
      el('span', { class: 'ko-when' }, [match.date + (match.time ? ' · ' + match.time : '')])
    ]));
    const home = buildSide(match, 'home', match.home);
    const away = buildSide(match, 'away', match.away);
    card.appendChild(home.sideEl);
    card.appendChild(away.sideEl);

    const penWrap = el('div', { class: 'pen-note' });
    penWrap.style.display = 'none';
    const penHome = el('button', { class: 'ko-pick', type: 'button' }, ['⚽ Pasa local']);
    const penAway = el('button', { class: 'ko-pick', type: 'button' }, ['⚽ Pasa visitante']);
    penHome.addEventListener('click', () => { state.pen['m' + match.n] = 'home'; save(); update(); });
    penAway.addEventListener('click', () => { state.pen['m' + match.n] = 'away'; save(); update(); });
    penWrap.appendChild(document.createTextNode('Empate · definir por penales: '));
    penWrap.appendChild(penHome);
    penWrap.appendChild(document.createTextNode(' '));
    penWrap.appendChild(penAway);
    card.appendChild(penWrap);

    koReg.push({ n: match.n, home, away, penWrap, penHome, penAway });
    return card;
  }

  function renderRound(containerId, matches) {
    const c = document.getElementById(containerId);
    matches.forEach(m => c.appendChild(buildKoCard(m)));
  }

  /* =====================================================================
     4) FINAL
     ===================================================================== */
  function buildFinal() {
    const F = WT.FINAL;
    const wrap = document.getElementById('final-wrap');
    const card = el('div', { class: 'final-card' });
    card.appendChild(el('h3', {}, ['Gran Final']));
    card.appendChild(el('p', { class: 'final-meta' }, [F.date + ' · ' + F.time + ' · ' + F.venue]));

    const stage = el('div', { class: 'final-stage' });

    function finalist(ref, who) {
      const f = el('div', { class: 'finalist' });
      const flag = el('span', { class: 'flag' });
      const img = el('img', { alt: '' }); img.style.opacity = '0';
      flag.appendChild(img); f.appendChild(flag);
      f.appendChild(el('span', { class: 'ref-tag' }, [ref]));
      const nameEl = el('span', { class: 'finalist-name tname--empty' }, ['—']);
      f.appendChild(nameEl);
      const fs = el('div', { class: 'finalist-score' });
      fs.appendChild(scoreInput(state.ks, 'mF-' + who));
      f.appendChild(fs);
      const pen = el('div', { class: 'finalist-pen' });
      pen.appendChild(el('span', { class: 'pen-cap' }, ['Penales']));
      pen.appendChild(scoreInput(state.ks, 'mF-' + who + '-pen'));
      f.appendChild(pen);
      return { f, img, nameEl, ref };
    }

    const home = finalist(F.home, 'h');
    stage.appendChild(home.f);

    const slot = el('div', { class: 'trophy-slot' });
    slot.appendChild(el('img', { src: 'imagenes/Copa-del-mundo.png', alt: 'Copa del Mundo' }));
    slot.appendChild(el('span', { class: 'vs' }, ['VS']));
    stage.appendChild(slot);

    const away = finalist(F.away, 'a');
    stage.appendChild(away.f);
    card.appendChild(stage);

    const toggle = el('label', { class: 'pen-toggle' });
    const chk = el('input', { type: 'checkbox' });
    if (state.flags.finalPen) { chk.checked = true; card.classList.add('show-pen'); }
    chk.addEventListener('change', () => {
      state.flags.finalPen = chk.checked;
      card.classList.toggle('show-pen', chk.checked);
      save(); update();
    });
    toggle.appendChild(chk);
    toggle.appendChild(document.createTextNode('Se define por penales'));
    card.appendChild(toggle);

    const champ = el('div', { class: 'champion empty' });
    const champLabel = el('span', {}, ['Cargá el resultado de la final']);
    const champName = el('span', { class: 'champion-name' }, ['']);
    champ.appendChild(champLabel); champ.appendChild(champName);
    card.appendChild(champ);

    wrap.appendChild(card);
    finalReg = { home, away, champ, champLabel, champName };
  }

  /* =====================================================================
     5) ACTUALIZACIÓN GLOBAL 
     ===================================================================== */
  function update() {
    const standings = {};
    WT.GROUPS.forEach(g => standings[g.id] = computeStanding(g));
    const thirds = computeThirds(standings);
    groupReg.forEach(r => renderStandingRows(r.g, standings[r.g.id], thirds, r.tbody));

    const thirdTeamOf = grp => standings[grp][2].team;

    // --- REPARTICIÓN ALEATORIA AUTOMÁTICA DE LOS MEJORES 8 TERCEROS ---
    // Chequeamos si el set de 8 clasificados es distinto al último que guardamos.
    const currentThirdsStr = thirds.qualified.map(t => t.group).sort().join('');
    if (state.lastThirdsStr !== currentThirdsStr || Object.keys(state.third).length === 0) {
      state.lastThirdsStr = currentThirdsStr;
      
      // Mezclamos al azar y los asignamos a los 8 slots de dieciseisavos
      const shuffled = thirds.qualified.map(t => t.group).sort(() => Math.random() - 0.5);
      let i = 0;
      state.third = {};
      koReg.forEach(entry => {
        if (entry.home.isThird) state.third[entry.n + '-h'] = shuffled[i++];
        if (entry.away.isThird) state.third[entry.n + '-a'] = shuffled[i++];
      });
    }

    const winner = {}, loser = {};
    function resolveRef(ref) {
      const p = WT.parseRef(ref);
      if (p.type === 'pos')  return standings[p.group] ? standings[p.group][p.pos - 1].team : null;
      if (p.type === 'win')  return winner[p.match] || null;
      if (p.type === 'lose') return loser[p.match] || null;
      if (p.type === 'fixed') return p.value;
      return null;
    }

    // El tercero se resuelve leyendo el mapeo aleatorio que quedó guardado
    function resolveThird(side) {
      const g = state.third[side.n + '-' + side.who.charAt(0)];
      return g ? thirdTeamOf(g) : null;
    }

    function decide(n, homeTeam, awayTeam) {
      const h = num(state.ks['m' + n + '-h']);
      const a = num(state.ks['m' + n + '-a']);
      let w = null, l = null, draw = false;
      if (homeTeam && awayTeam && h !== null && a !== null) {
        if (h > a) { w = homeTeam; l = awayTeam; }
        else if (a > h) { w = awayTeam; l = homeTeam; }
        else {
          draw = true;
          const pk = state.pen['m' + n];
          if (pk === 'home') { w = homeTeam; l = awayTeam; }
          else if (pk === 'away') { w = awayTeam; l = homeTeam; }
        }
      }
      winner[n] = w; loser[n] = l;
      return { h, a, w, l, draw };
    }

    function paintSide(side, team, isWinner) {
      setFlag(side.img, team);
      side.nameEl.textContent = team || '—';
      side.nameEl.classList.toggle('tname--empty', !team);
      side.sideEl.classList.toggle('win', !!isWinner);
    }

    koReg.forEach(entry => {
      const homeTeam = entry.home.isThird ? resolveThird(entry.home) : resolveRef(entry.home.ref);
      const awayTeam = entry.away.isThird ? resolveThird(entry.away) : resolveRef(entry.away.ref);
      const res = decide(entry.n, homeTeam, awayTeam);
      paintSide(entry.home, homeTeam, res.w && res.w === homeTeam);
      paintSide(entry.away, awayTeam, res.w && res.w === awayTeam);

      if (res.draw) {
        entry.penWrap.style.display = '';
        entry.penHome.textContent = '⚽ Pasa ' + (homeTeam || 'local');
        entry.penAway.textContent = '⚽ Pasa ' + (awayTeam || 'visitante');
        entry.penHome.classList.toggle('active', state.pen['m' + entry.n] === 'home');
        entry.penAway.classList.toggle('active', state.pen['m' + entry.n] === 'away');
      } else {
        entry.penWrap.style.display = 'none';
      }
    });

    const F = WT.FINAL;
    const homeT = resolveRef(F.home);
    const awayT = resolveRef(F.away);
    setFlag(finalReg.home.img, homeT);
    finalReg.home.nameEl.textContent = homeT || '—';
    finalReg.home.nameEl.classList.toggle('tname--empty', !homeT);
    setFlag(finalReg.away.img, awayT);
    finalReg.away.nameEl.textContent = awayT || '—';
    finalReg.away.nameEl.classList.toggle('tname--empty', !awayT);

    const fh = num(state.ks['mF-h']);
    const fa = num(state.ks['mF-a']);
    let champ = null, label = 'Cargá el resultado de la final';
    if (homeT && awayT && fh !== null && fa !== null) {
      if (fh > fa) champ = homeT;
      else if (fa > fh) champ = awayT;
      else if (state.flags.finalPen) {
        const ph = num(state.ks['mF-h-pen']);
        const pa = num(state.ks['mF-a-pen']);
        if (ph !== null && pa !== null && ph !== pa) champ = ph > pa ? homeT : awayT;
        else label = 'Empate · cargá los penales';
      } else {
        label = 'Empate · tildá "Se define por penales"';
      }
    }
    if (champ) {
      finalReg.champ.classList.remove('empty');
      finalReg.champLabel.textContent = '¡ CAMPEÓN DEL MUNDO !';
      finalReg.champName.textContent = champ;
    } else {
      finalReg.champ.classList.add('empty');
      finalReg.champLabel.textContent = label;
      finalReg.champName.textContent = '';
    }

    save();
  }

  /* =====================================================================
     6) NAVEGACIÓN E INICIO
     ===================================================================== */
  function setupTabs() {
    const tabs = document.querySelectorAll('#tabs .tab-btn');
    const parts = document.querySelectorAll('.part');
    tabs.forEach(btn => btn.addEventListener('click', () => {
      tabs.forEach(b => b.classList.toggle('active', b === btn));
      parts.forEach(sec => sec.classList.toggle('active', sec.dataset.part === btn.dataset.part));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  document.getElementById('btn-reset').addEventListener('click', () => {
    if (confirm('¿Borrar toda la simulación del predictor?')) {
      localStorage.removeItem(KEY);
      location.reload();
    }
  });

  WT.GROUPS.slice(0, 6).forEach(g => document.getElementById('groups-1').appendChild(renderGroup(g)));
  WT.GROUPS.slice(6).forEach(g => document.getElementById('groups-2').appendChild(renderGroup(g)));
  renderRound('round-r32', WT.R32);
  renderRound('round-r16', WT.R16);
  renderRound('round-qf', WT.QF);
  renderRound('round-sf', WT.SF);
  renderRound('round-third', [WT.THIRD]);
  buildFinal();
  setupTabs();
  update();
})();