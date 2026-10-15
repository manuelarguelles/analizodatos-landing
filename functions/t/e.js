// Función de Cloudflare Pages: POST /t/e (mismo origen que el sitio).
// Recibe el evento del script t.js, le agrega lo que SOLO el borde conoce (IP real, país, ciudad, ASN) y lo reenvía
// a la API de gemelo-web firmado con una clave compartida. Responde 204 siempre: la medición nunca rompe la página.
// Variables (Pages → Settings → Environment variables): TRACKER_KEY (secreta), TRACKER_URL (opcional).
const CAMPOS = ['kind', 'pv', 'sid', 'host', 'path', 'ref', 'url', 'text', 'active_ms', 'scroll', 'lang'];

export async function onRequestPost({ request, env, waitUntil }) {
  const fin = new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  try {
    if (!env.TRACKER_KEY) return fin;
    const texto = await request.text();
    if (texto.length > 4000) return fin;
    const crudo = JSON.parse(texto);
    const cf = request.cf || {};
    const ev = {};
    for (const k of CAMPOS) if (crudo[k] !== undefined) ev[k] = crudo[k];
    ev.ip = request.headers.get('CF-Connecting-IP') || '';
    ev.ua = request.headers.get('User-Agent') || '';
    ev.country = cf.country || ''; ev.region = cf.region || ''; ev.city = cf.city || ''; ev.asn = cf.asn || 0;
    const envio = fetch(env.TRACKER_URL || 'https://gemelo-api.analizodatos.com/t/in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Tracker-Key': env.TRACKER_KEY },
      body: JSON.stringify(ev),
    }).catch(() => { });
    waitUntil(envio);
  } catch { /* se ignora: es solo medición */ }
  return fin;
}
