/* Gemelo web de Manuel — widget de chat. Sin dependencias. IA con límites: ver gemelo-api. */
(function () {
  var C = window.GEMELO_CONFIG; if (!C) return;
  // Esperar a que React termine de hidratar la home: montar antes borraría el widget.
  function boot(fn) { if (document.readyState === 'complete') setTimeout(fn, 1500); else window.addEventListener('load', function () { setTimeout(fn, 1500); }); }
  boot(init);
  function init() {
  var es = (document.documentElement.lang || 'es').slice(0, 2) !== 'en';
  var T = es ? { open: 'Habla con mi gemelo', title: 'Gemelo de Manuel', sub: 'IA · responde sobre su trabajo y agenda reuniones', ph: 'Escribe tu pregunta…', send: 'Enviar', hi: 'Hola, soy el gemelo de IA de Manuel. Puedo contarte sobre su trabajo en datos y agentes, o ayudarte a agendar una llamada de 30 minutos. ¿Qué te trae por aquí?', book: 'Sí, agendar', human: 'Verificando…', err: 'No pude conectar. Intenta de nuevo o escribe a manuel.arguelles.peru@gmail.com.', priv: 'Es una IA. Guardamos la conversación 90 días para mejorar el servicio.', close: 'Cerrar' }
    : { open: 'Talk to my twin', title: "Manuel's twin", sub: 'AI · answers about his work and books meetings', ph: 'Type your question…', send: 'Send', hi: "Hi, I'm Manuel's AI twin. I can tell you about his data and agents work, or help you book a 30-minute call. What brings you here?", book: 'Yes, book', human: 'Verifying…', err: 'Could not connect. Try again or email manuel.arguelles.peru@gmail.com.', priv: 'This is an AI. Conversations are kept 90 days to improve the service.', close: 'Close' };
  var css = '#gm-fab{position:fixed;right:28px;bottom:100px;z-index:99990;border:0;border-radius:999px;padding:13px 20px;font:600 14px Inter,system-ui,sans-serif;color:#fff;background:linear-gradient(135deg,#7b6cff,#ff5e8a);box-shadow:0 8px 30px rgba(91,75,255,.45);cursor:pointer}#gm-fab:focus-visible,#gm-in:focus-visible,#gm-send:focus-visible,.gm-book:focus-visible{outline:2px solid #37e0c8;outline-offset:2px}'
    + '#gm-box{position:fixed;right:18px;bottom:18px;z-index:99991;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 36px));display:none;flex-direction:column;border-radius:18px;overflow:hidden;background:rgba(10,12,28,.96);color:#eaf0ff;border:1px solid rgba(255,255,255,.12);box-shadow:0 20px 60px rgba(0,0,0,.55);font:14px/1.5 Inter,system-ui,sans-serif;backdrop-filter:blur(14px)}#gm-box.on{display:flex}'
    + '#gm-hd{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(255,255,255,.1)}#gm-hd b{font:600 15px "Space Grotesk",Inter,sans-serif}#gm-hd small{display:block;color:#9aa6c6;font-size:11.5px}#gm-x{margin-left:auto;background:none;border:0;color:#9aa6c6;font-size:22px;cursor:pointer;line-height:1}'
    + '#gm-log{flex:1;overflow:auto;padding:14px 14px 4px;display:flex;flex-direction:column;gap:10px}.gm-m{max-width:88%;padding:9px 12px;border-radius:14px;white-space:pre-wrap;word-wrap:break-word}.gm-b{align-self:flex-start;background:rgba(255,255,255,.07)}.gm-u{align-self:flex-end;background:#5b4bff;color:#fff}.gm-book{align-self:flex-start;display:inline-block;margin:2px 0 4px;padding:9px 16px;border-radius:999px;background:linear-gradient(135deg,#37e0c8,#7b6cff);color:#02030a;font-weight:700;text-decoration:none}'
    + '#gm-f{display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(255,255,255,.1)}#gm-in{flex:1;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#eaf0ff;border-radius:10px;padding:10px 12px;font:inherit}#gm-send{border:0;border-radius:10px;padding:0 14px;background:#7b6cff;color:#fff;font:600 13px inherit;cursor:pointer}#gm-send[disabled]{opacity:.5}#gm-pv{padding:0 14px 10px;color:#7d88a8;font-size:11px}#gm-ts{display:flex;justify-content:center;padding:0 12px}#gm-ts:empty{display:none}'
    + '@media (prefers-color-scheme:light){html:not([data-theme="dark"]) #gm-box{background:rgba(255,255,255,.97);color:#161a2b;border-color:rgba(20,24,50,.12)}html:not([data-theme="dark"]) .gm-b{background:rgba(20,24,50,.06)}html:not([data-theme="dark"]) #gm-in{background:#fff;color:#161a2b;border-color:rgba(20,24,50,.18)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var fab = document.createElement('button'); fab.id = 'gm-fab'; fab.type = 'button'; fab.textContent = T.open; fab.setAttribute('aria-label', T.open);
  var box = document.createElement('div'); box.id = 'gm-box'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', T.title);
  box.innerHTML = '<div id="gm-hd"><div><b>' + T.title + '</b><small>' + T.sub + '</small></div><button id="gm-x" type="button" aria-label="' + T.close + '">×</button></div><div id="gm-log" aria-live="polite"></div><div id="gm-pv">' + T.priv + '</div><div id="gm-ts"></div><form id="gm-f"><input id="gm-in" autocomplete="off" maxlength="1500" placeholder="' + T.ph + '" aria-label="' + T.ph + '"><button id="gm-send" type="submit">' + T.send + '</button></form>';
  document.body.appendChild(fab); document.body.appendChild(box);
  var log = box.querySelector('#gm-log'), form = box.querySelector('#gm-f'), input = box.querySelector('#gm-in'), send = box.querySelector('#gm-send');
  var token = null, busy = false, started = false, tsId = null, convo = [];
  function add(cls, text) { var d = document.createElement('div'); d.className = 'gm-m ' + cls; d.textContent = text; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function loadTurnstile(cb) {
    if (window.turnstile) return cb(); var s = document.createElement('script'); s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'; s.async = true; s.onload = cb; s.onerror = function () { add('gm-b', T.err); }; document.head.appendChild(s);
  }
  function ensureSession() {
    return new Promise(function (resolve, reject) {
      if (token) return resolve(token);
      loadTurnstile(function () {
        var holder = box.querySelector('#gm-ts'); holder.innerHTML = ''; add('gm-b', es ? 'Para empezar, marca la casilla de verificación.' : 'To start, tick the verification box.');
        tsId = window.turnstile.render(holder, { sitekey: C.turnstileSiteKey, size: 'flexible', callback: function (tk) {
          fetch(C.api + '/api/session', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ turnstile: tk }) }).then(function (r) { return r.json(); }).then(function (j) { if (!j.token) throw 0; token = j.token; holder.innerHTML = ''; resolve(token); }).catch(reject);
        }, 'error-callback': reject });
      });
    });
  }
  function open() { box.classList.add('on'); fab.style.display = 'none'; if (!started) { started = true; add('gm-b', T.hi); } input.focus(); }
  function close() { box.classList.remove('on'); fab.style.display = ''; }
  fab.addEventListener('click', open); box.querySelector('#gm-x').addEventListener('click', close);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('on')) close(); });
  window.addEventListener('gemelo:open', open);
  function ctxText() { return convo.filter(function (m) { return m.u && ['inyeccion', 'abuso_spam', 'extractor', 'sensible_personal', 'blocked', 'error'].indexOf(m.i) < 0; }).map(function (m) { return m.u; }).join(' · ').slice(0, 280); }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); var text = input.value.trim(); if (!text || busy) return; busy = true; send.disabled = true; input.value = '';
    add('gm-u', text); convo.push({ u: text });
    ensureSession().then(function (tk) {
      var bubble = add('gm-b', '…');
      return fetch(C.api + '/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: tk, message: text }) }).then(function (r) {
        if (r.status === 401) { token = null; throw new Error('sesión'); }
        if (r.status === 429) { bubble.textContent = es ? 'Vas muy rápido; espera unos minutos.' : 'Slow down a bit; try again in a few minutes.'; return; }
        var reader = r.body.getReader(), dec = new TextDecoder(), buf = '', first = true;
        function pump() { return reader.read().then(function (o) {
          if (o.done) return; buf += dec.decode(o.value, { stream: true }); var parts = buf.split('\n\n'); buf = parts.pop();
          parts.forEach(function (p) { var ev = (p.match(/^event: (.*)$/m) || [])[1], dat = (p.match(/^data: (.*)$/m) || [])[1]; if (!dat) return; var j = JSON.parse(dat);
            if (ev === 'delta') { if (first) { bubble.textContent = ''; first = false; } bubble.textContent += j.text; log.scrollTop = log.scrollHeight; }
            if (ev === 'done') { convo[convo.length - 1].i = j.intent; }
            if (ev === 'done' && j.cta === 'agendar') { var a = document.createElement('a'); a.className = 'gm-book'; a.href = '/agendar/?ctx=' + encodeURIComponent(ctxText()) + '&i=' + encodeURIComponent(j.intent); a.textContent = T.book; log.appendChild(a); log.scrollTop = log.scrollHeight; } });
          return pump(); }); }
        return pump();
      });
    }).catch(function () { add('gm-b', T.err); }).then(function () { busy = false; send.disabled = false; input.focus(); });
  });
}
})();
