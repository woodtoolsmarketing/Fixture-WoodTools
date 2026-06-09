# Fixture-WoodTools

Sitio del Mundial 2026: **Fixture**, **Predecí tu mundial** (predictor) y **Prode** (competencia con puntaje).

## Páginas
- `index.html` — Fixture para completar a mano.
- `predictor.html` — Predecí tu mundial (simulador con tabla, mejores 3.º y avance automático).
- `prode.html` — Prode con 2 modalidades (Fase de grupos / Mundial completo), guardado y bloqueo.
- `resultados.html` — Ranking público (solo nombre + puntos), dividido por modalidad.
- `admin.html` — Panel **privado** (pide clave) con los datos de los participantes y carga de resultados reales. No está enlazado en la navegación.

## Backend (Node + Express + Supabase)
- `server.js` sirve el sitio estático y la API del Prode.
- Datos en **Supabase** (tablas `prode_participantes` y `prode_resultados`, con RLS: solo el backend accede).
- Puntaje: **3** resultado exacto · **1** acertar ganador/empate · **0** el resto.
- Anti-fraude: una participación por **modalidad**; se rechaza teléfono / Instagram / IP repetidos.
- Resultados reales: cargables a mano desde `/admin.html` y verificables contra **API-Football**.

### Correr local
```
npm install
# copiá .env.example a .env y completá los secretos
npm start            # http://localhost:8765
```

### Variables de entorno (.env / Render)
`SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `APIFOOTBALL_URL`, `APIFOOTBALL_KEY`, `ADMIN_TOKEN`.
Los secretos **nunca** van al front ni a git (ver `.gitignore`).

### Deploy en Render
Hoy el sitio es un *Static Site*. Para el Prode hace falta un *Web Service* (Node): ver `render.yaml`.
El panel interno queda en `https://TU-SITIO/admin.html` (con la clave `ADMIN_TOKEN`).

## API
- `POST /api/prode/submit` — guarda un pronóstico `{mode, nombre, telefono, instagram, prediction}`.
- `GET  /api/prode/status` — si la IP ya participó (para bloquear la página).
- `GET  /api/leaderboard?mode=grupos|completo` — ranking público.
- `GET  /api/admin/participantes` · `POST /api/admin/resultado` — requieren header `x-admin-token`.
