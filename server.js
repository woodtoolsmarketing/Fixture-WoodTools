/* =========================================================================
   WoodTools · Prode Mundial 2026 — Backend (Express + Supabase + API-Football)
   Sirve el sitio estático y expone la API del Prode.
   Los secretos se leen de variables de entorno (.env local / Render).
   ========================================================================= */
'use strict';
require('dotenv').config();

const path = require('path');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const {
  PORT = 8765,
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  APIFOOTBALL_URL = 'https://v3.football.api-sports.io',
  APIFOOTBALL_KEY,
  THESPORTSDB_KEY = '3',
  ADMIN_TOKEN = 'cambia-esta-clave'
} = process.env;
const results = require('./lib/results');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Faltan SUPABASE_URL / SUPABASE_SERVICE_KEY en el entorno.');
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

const app = express();
app.set('trust proxy', true);            // Render está detrás de proxy: respeta X-Forwarded-For
app.use(express.json({ limit: '256kb' }));

/* --------------------------- helpers --------------------------- */
const norm = {
  tel: v => String(v || '').replace(/\D/g, ''),
  ig:  v => String(v || '').trim().toLowerCase().replace(/^@+/, '').replace(/\s+/g, ''),
  nombre: v => String(v || '').trim().replace(/\s+/g, ' ')
};
const clientIp = req => (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.ip || '';
const sign = x => (x > 0 ? 1 : x < 0 ? -1 : 0);

// Extrae el "match key" (g-A-0, m73, mF) de una clave de gol (g-A-0-h, m73-a...).
function predToMatches(prediction) {
  const out = {};
  const add = (obj) => {
    if (!obj) return;
    for (const k in obj) {
      const mk = k.replace(/-h$/, '#h').replace(/-a$/, '#a');
      if (!/#[ha]$/.test(mk)) continue;
      const [base, side] = mk.split('#');
      (out[base] = out[base] || {})[side] = obj[k];
    }
  };
  add(prediction.gs);   // fase de grupos
  add(prediction.ks);   // eliminatorias (solo modalidad completa)
  return out;
}

// Puntúa una predicción contra los resultados reales. 3 = exacto, 1 = tendencia, 0.
function scorePrediction(prediction, resultsMap) {
  const matches = predToMatches(prediction || {});
  let pts = 0, aciertos = 0, jugados = 0;
  for (const key in matches) {
    const real = resultsMap[key];
    if (!real) continue;                       // partido todavía no jugado/cargado
    const ph = Number(matches[key].h), pa = Number(matches[key].a);
    if (!Number.isFinite(ph) || !Number.isFinite(pa)) continue;
    jugados++;
    if (ph === real.h && pa === real.a) { pts += 3; aciertos++; }
    else if (sign(ph - pa) === sign(real.h - real.a)) { pts += 1; }
  }
  return { pts, aciertos, jugados };
}

async function getResultsMap() {
  const { data, error } = await sb.from('prode_resultados').select('match_key,gh,ga');
  if (error) throw error;
  const map = {};
  (data || []).forEach(r => { map[r.match_key] = { h: r.gh, a: r.ga }; });
  return map;
}

const adminOnly = (req, res, next) => {
  const t = req.headers['x-admin-token'] || req.query.token;
  if (t !== ADMIN_TOKEN) return res.status(401).json({ error: 'No autorizado' });
  next();
};

/* =========================================================================
   API PÚBLICA
   ========================================================================= */

// ¿Esta IP ya participó? (para bloquear la página)
app.get('/api/prode/status', async (req, res) => {
  try {
    const ip = clientIp(req);
    const { data, error } = await sb.from('prode_participantes')
      .select('modalidad,nombre').eq('ip', ip);
    if (error) throw error;
    const r = { grupos: null, completo: null };
    (data || []).forEach(p => { r[p.modalidad] = { nombre: p.nombre }; });
    res.json(r);
  } catch (e) { res.status(500).json({ error: 'Error consultando estado' }); }
});

// Guardar un Prode (una sola vez por modalidad; sin datos duplicados)
app.post('/api/prode/submit', async (req, res) => {
  try {
    const { mode, nombre, telefono, instagram, prediction } = req.body || {};
    if (!['grupos', 'completo'].includes(mode)) return res.status(400).json({ error: 'Modalidad inválida' });
    const nom = norm.nombre(nombre), tel = norm.tel(telefono), ig = norm.ig(instagram);
    if (!nom || tel.length < 6 || !ig) return res.status(400).json({ error: 'Completá nombre, teléfono e Instagram válidos.' });
    if (!prediction || typeof prediction !== 'object') return res.status(400).json({ error: 'Falta el pronóstico.' });
    const ip = clientIp(req);

    // ¿ya hay alguien con esa IP / teléfono / instagram en esta modalidad?
    const { data: dups, error: dErr } = await sb.from('prode_participantes')
      .select('id,telefono,instagram,ip')
      .eq('modalidad', mode)
      .or(`telefono.eq.${tel},instagram.eq.${ig},ip.eq.${ip}`);
    if (dErr) throw dErr;
    if (dups && dups.length) {
      return res.status(409).json({ error: 'Ya existe una participación en esta modalidad con esos datos (teléfono, Instagram o dispositivo).' });
    }

    const { error: iErr } = await sb.from('prode_participantes').insert({
      modalidad: mode, nombre: nom, telefono: tel, instagram: ig, ip, prediction
    });
    if (iErr) {
      if (iErr.code === '23505') return res.status(409).json({ error: 'Ya participaste en esta modalidad.' });
      throw iErr;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('submit', e);
    res.status(500).json({ error: 'No se pudo guardar. Probá de nuevo.' });
  }
});

// Ranking público (solo nombre + puntos)
app.get('/api/leaderboard', async (req, res) => {
  try {
    const mode = ['grupos', 'completo'].includes(req.query.mode) ? req.query.mode : 'completo';
    const [{ data, error }, resultsMap] = await Promise.all([
      sb.from('prode_participantes').select('nombre,prediction').eq('modalidad', mode),
      getResultsMap()
    ]);
    if (error) throw error;
    const tabla = (data || []).map(p => {
      const s = scorePrediction(p.prediction, resultsMap);
      return { nombre: p.nombre, puntos: s.pts, aciertos: s.aciertos };
    }).sort((a, b) => b.puntos - a.puntos || b.aciertos - a.aciertos || a.nombre.localeCompare(b.nombre));
    res.json({ mode, jugados: Object.keys(resultsMap).length, tabla });
  } catch (e) { res.status(500).json({ error: 'Error armando el ranking' }); }
});

/* =========================================================================
   API ADMIN (requiere header x-admin-token o ?token=)
   ========================================================================= */

// Todos los participantes con sus datos completos
app.get('/api/admin/participantes', adminOnly, async (req, res) => {
  try {
    const [{ data, error }, resultsMap] = await Promise.all([
      sb.from('prode_participantes').select('*').order('created_at', { ascending: true }),
      getResultsMap()
    ]);
    if (error) throw error;
    const rows = (data || []).map(p => ({
      ...p, ...scorePrediction(p.prediction, resultsMap)
    }));
    res.json({ total: rows.length, participantes: rows });
  } catch (e) { res.status(500).json({ error: 'Error' }); }
});

// Cargar/actualizar un resultado real a mano (match_key: g-A-0, m73, mF, mTP...)
app.post('/api/admin/resultado', adminOnly, async (req, res) => {
  try {
    const { match_key, gh, ga } = req.body || {};
    if (!match_key || !Number.isInteger(gh) || !Number.isInteger(ga))
      return res.status(400).json({ error: 'Enviá match_key, gh y ga (enteros).' });
    const { error } = await sb.from('prode_resultados')
      .upsert({ match_key, gh, ga, updated_at: new Date().toISOString() });
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Error guardando resultado' }); }
});

// Sincroniza los resultados de la fase de grupos desde TheSportsDB (Mundial 2026)
app.post('/api/admin/sync', adminOnly, async (req, res) => {
  try {
    const rep = await results.syncGroups(THESPORTSDB_KEY);
    if (rep.matched.length) {
      const rows = rep.matched.map(m => ({
        match_key: m.match_key, gh: m.gh, ga: m.ga, updated_at: new Date().toISOString()
      }));
      const { error } = await sb.from('prode_resultados').upsert(rows);
      if (error) throw error;
    }
    res.json({
      ok: true,
      guardados: rep.matched.length,
      pendientes: rep.pending.length,
      totalEventos: rep.totalEventos,
      equiposSinMapear: rep.unmatchedTeams
    });
  } catch (e) { res.status(502).json({ error: 'No se pudo sincronizar: ' + e.message }); }
});

// Verifica que la API key de API-Football funcione
app.get('/api/admin/apifootball/status', adminOnly, async (req, res) => {
  try {
    const r = await fetch(APIFOOTBALL_URL + '/status', { headers: { 'x-apisports-key': APIFOOTBALL_KEY } });
    res.status(r.ok ? 200 : 502).json(await r.json());
  } catch (e) { res.status(502).json({ error: 'No se pudo contactar API-Football' }); }
});

/* =========================================================================
   SITIO ESTÁTICO
   ========================================================================= */
app.use(express.static(__dirname, { extensions: ['html'] }));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.listen(PORT, () => console.log('WoodTools Prode escuchando en :' + PORT));
