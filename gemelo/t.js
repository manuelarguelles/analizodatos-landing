/* analizodatos.com · medición propia, sin cookies. ~1,6 KB.
   Qué envía: página vista, tiempo ACTIVO en la página (pestaña visible), profundidad de scroll y clics a otros sitios.
   Qué NO hace: no usa cookies ni localStorage (el id de sesión vive en sessionStorage y muere con la pestaña), no guarda
   query strings ni el contenido de la página, y se apaga solo si el navegador pide Do Not Track o Global Privacy Control.
   Los eventos se guardan 90 días. Detalle: https://analizodatos.com/privacidad/ */
(function () {
  try {
    var n = navigator;
    if (n.doNotTrack === '1' || window.doNotTrack === '1' || n.globalPrivacyControl) return;
    var tag = document.currentScript;
    var EP = (tag && tag.getAttribute('data-endpoint')) || '/t/e';   // mismo origen (Función de Cloudflare); en otros sitios: la URL pública de la API
    var C = 'abcdefghijklmnopqrstuvwxyz0123456789';
    var id = function () {
      var a = '', i;
      try { var r = crypto.getRandomValues(new Uint8Array(16)); for (i = 0; i < 16; i++) a += C[r[i] % 36]; }
      catch (e) { for (i = 0; i < 16; i++) a += C[Math.floor(Math.random() * 36)]; }
      return a;
    };
    var sid;
    try { sid = sessionStorage.getItem('_ad_sid'); if (!sid) { sid = id(); sessionStorage.setItem('_ad_sid', sid); } } catch (e) { sid = id(); }
    var pv = id(), host = location.hostname.toLowerCase(), path = location.pathname;
    var bare = function (h) { return h.replace(/^www\./, ''); };

    function send(o) {
      o.pv = pv; o.sid = sid; o.host = host; o.path = path; o.lang = n.language || '';
      var b = JSON.stringify(o);
      try { if (n.sendBeacon && n.sendBeacon(EP, new Blob([b], { type: 'text/plain' }))) return; } catch (e) { }
      try { fetch(EP, { method: 'POST', body: b, keepalive: true, mode: 'no-cors', headers: { 'Content-Type': 'text/plain' } }); } catch (e) { }
    }

    var active = 0, last = document.hidden ? 0 : Date.now(), maxScroll = 0;
    function tick() { if (last) { var t = Date.now(); active += t - last; last = t; } }
    function scroll() {
      var h = document.documentElement, tot = h.scrollHeight - h.clientHeight;
      var p = tot > 0 ? Math.round(100 * (window.scrollY || h.scrollTop) / tot) : 100;
      if (p > maxScroll) maxScroll = Math.min(p, 100);
    }
    function ping() { tick(); scroll(); send({ kind: 'ping', active_ms: active, scroll: maxScroll }); }

    send({ kind: 'view', ref: document.referrer });
    addEventListener('scroll', scroll, { passive: true }); scroll();
    document.addEventListener('visibilitychange', function () { if (document.hidden) { ping(); last = 0; } else { last = Date.now(); } });
    addEventListener('pagehide', ping);
    setInterval(function () { if (!document.hidden) ping(); }, 15000);

    // clics a otros sitios (incluidos otros subdominios propios): «hipervínculos desde aquí»
    document.addEventListener('click', function (e) {
      var a = e.target && e.target.closest && e.target.closest('a[href]'); if (!a) return;
      var u; try { u = new URL(a.href, location.href); } catch (x) { return; }
      if (/^https?:$/.test(u.protocol) && u.hostname.toLowerCase() !== host) {
        send({ kind: 'click', url: u.origin + u.pathname, text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 80) });
      }
    }, true);
  } catch (e) { /* la medición nunca debe romper la página */ }
})();
