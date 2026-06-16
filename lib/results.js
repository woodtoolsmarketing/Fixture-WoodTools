/* =========================================================================
   WoodTools · Prode — Adaptador de resultados (TheSportsDB)
   Descarga los partidos del Mundial 2026 (liga 4429) y los mapea a las
   claves de nuestro fixture (g-A-0 … g-L-5) por par de selecciones.
   Las eliminatorias se cargan a mano por ahora (los equipos dependen de
   cómo termine la fase de grupos).
   ========================================================================= */
'use strict';
const WT = require('../js/data.js');

const TSDB_LEAGUE = '4429';     // FIFA World Cup en TheSportsDB
const TSDB_SEASON = '2026';

// Normaliza un nombre para comparar (sin acentos/símbolos, minúsculas).
const normalize = s => String(s || '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '');

// Nombre nuestro (ES) -> posibles nombres en TheSportsDB (EN y variantes).
const ALIASES = {
  'México': ['Mexico'], 'Sudáfrica': ['South Africa'], 'Corea del Sur': ['South Korea', 'Korea Republic'],
  'Rep. Checa': ['Czech Republic', 'Czechia'], 'Canadá': ['Canada'], 'Bosnia y Herz.': ['Bosnia-Herzegovina', 'Bosnia and Herzegovina'],
  'Qatar': ['Qatar'], 'Suiza': ['Switzerland'], 'Brasil': ['Brazil'], 'Marruecos': ['Morocco'],
  'Haití': ['Haiti'], 'Escocia': ['Scotland'], 'Estados Unidos': ['USA', 'United States'], 'Paraguay': ['Paraguay'],
  'Australia': ['Australia'], 'Turquía': ['Turkey', 'Türkiye', 'Turkiye'], 'Alemania': ['Germany'], 'Curazao': ['Curacao', 'Curaçao'],
  'Costa de Marfil': ['Ivory Coast', "Cote d'Ivoire", 'Côte d’Ivoire'], 'Ecuador': ['Ecuador'],
  'Países Bajos': ['Netherlands', 'Holland'], 'Japón': ['Japan'], 'Suecia': ['Sweden'], 'Túnez': ['Tunisia'],
  'Bélgica': ['Belgium'], 'Egipto': ['Egypt'], 'Irán': ['Iran'], 'Nueva Zelanda': ['New Zealand'],
  'España': ['Spain'], 'Cabo Verde': ['Cape Verde', 'Cabo Verde'], 'Arabia Saudita': ['Saudi Arabia'], 'Uruguay': ['Uruguay'],
  'Francia': ['France'], 'Senegal': ['Senegal'], 'Irak': ['Iraq'], 'Noruega': ['Norway'],
  'Argentina': ['Argentina'], 'Argelia': ['Algeria'], 'Austria': ['Austria'], 'Jordania': ['Jordan'],
  'Portugal': ['Portugal'], 'RD Congo': ['DR Congo', 'Congo DR', 'Democratic Republic of Congo'],
  'Uzbekistán': ['Uzbekistan'], 'Colombia': ['Colombia'], 'Inglaterra': ['England'], 'Croacia': ['Croatia'],
  'Ghana': ['Ghana'], 'Panamá': ['Panama']
};

// Índice: nombre normalizado (nuestro ES + alias EN) -> nombre nuestro.
const TEAM_INDEX = (() => {
  const idx = {};
  WT.GROUPS.forEach(g => g.teams.forEach(t => { idx[normalize(t)] = t; }));
  Object.keys(ALIASES).forEach(es => ALIASES[es].forEach(en => { idx[normalize(en)] = es; }));
  return idx;
})();
const toOurName = name => TEAM_INDEX[normalize(name)] || null;

// Índice de partidos de grupos: "parNormalizado" -> clave (g-A-0).
const GROUP_PAIR_INDEX = (() => {
  const idx = {};
  WT.GROUPS.forEach(g => g.matches.forEach((m, i) => {
    const pair = [normalize(m.home), normalize(m.away)].sort().join('|');
    idx[pair] = 'g-' + g.id + '-' + i;
  }));
  return idx;
})();

// Fechas únicas de la fase de grupos (de nuestro fixture) en formato YYYY-MM-DD.
function groupDates() {
  const set = new Set();
  WT.GROUPS.forEach(g => g.matches.forEach(m => {
    const mt = /(\d{2})\/(\d{2})/.exec(m.date);
    if (mt) set.add(TSDB_SEASON + '-' + mt[2] + '-' + mt[1]);
  }));
  return [...set].sort();
}

// Partidos de un día puntual del Mundial. La API gratuita responde completo por día
// (a diferencia de "por temporada", que devuelve un subconjunto limitado).
async function fetchDay(key, date) {
  const url = `https://www.thesportsdb.com/api/v1/json/${key || '3'}/eventsday.php?d=${date}&l=${TSDB_LEAGUE}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return [];
    const data = await r.json();
    return data.events || [];
  } catch (e) { return []; }
}

// Convierte los eventos de TSDB en resultados de fase de grupos mapeados.
function mapGroupResults(events) {
  const matched = [], unmatchedTeams = new Set(), pending = [];
  events.forEach(ev => {
    const home = toOurName(ev.strHomeTeam);
    const away = toOurName(ev.strAwayTeam);
    if (!home) unmatchedTeams.add(ev.strHomeTeam);
    if (!away) unmatchedTeams.add(ev.strAwayTeam);
    if (!home || !away) return;
    const key = GROUP_PAIR_INDEX[[normalize(home), normalize(away)].sort().join('|')];
    if (!key) return;                      // no es un cruce de fase de grupos nuestro
    const gh = ev.intHomeScore, ga = ev.intAwayScore;
    if (gh === null || gh === '' || ga === null || ga === '' || gh == null || ga == null) {
      pending.push({ key, home, away });   // partido todavía sin jugar
      return;
    }
    matched.push({ match_key: key, gh: parseInt(gh, 10), ga: parseInt(ga, 10), home, away });
  });
  return { matched, pending, unmatchedTeams: [...unmatchedTeams] };
}

// Recorre día por día (solo fechas hasta hoy) para esquivar el límite de la API.
async function syncGroups(key) {
  const today = new Date().toISOString().slice(0, 10);
  const dias = groupDates().filter(d => d <= today);
  let events = [];
  for (const d of dias) {
    events = events.concat(await fetchDay(key, d));
    await new Promise(r => setTimeout(r, 250)); // respeta el límite por minuto
  }
  return Object.assign({ totalEventos: events.length, dias: dias.length }, mapGroupResults(events));
}

module.exports = { syncGroups, fetchDay, groupDates, mapGroupResults, toOurName, GROUP_PAIR_INDEX };
