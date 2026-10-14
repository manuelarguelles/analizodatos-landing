#!/bin/bash
# Reconstruye el sitio completo de analizodatos.com (estático) y lo despliega a Cloudflare Pages (proyecto analizodatos-landing).
# Fuentes: home viva con el recorrido (artifacts/index-scroll-analizodatos/home-scroll), build Next (analizodatos-next/out), recorrido de las 9 capas,
# blog, 6M-IA, webinar OpenClaw+Codex, tier-list, workflow, consigue-empleo-remoto. Credenciales: ~/.config/cloudflare (nunca se imprimen).
#   bash armar-sitio.sh            # arma y despliega
#   bash armar-sitio.sh --solo-armar
set -euo pipefail
C=~/clawd; S=/tmp/ad-site-$(date +%Y%m%d-%H%M%S)
# cada build pesa ~117 MB: conserva solo el último (llenó el disco el 14-oct-2026)
ls -dt /tmp/ad-site-* 2>/dev/null | tail -n +2 | while read -r d; do rm -rf "$d"; done
mkdir -p "$S"
rsync -a --exclude index.txt $C/projects/analizodatos-next/out/ "$S"/
cp $C/artifacts/index-scroll-analizodatos/home-scroll/index.html "$S/index.html"
mkdir -p "$S/assets"; rsync -a $C/projects/analizodatos-landing/assets/ "$S/assets/"; cp "$S/assets/manuel-photo.jpg" "$S/manu.jpg"
# Gemelo web: widget en la home + página /agendar (la API vive en gemelo-api.analizodatos.com)
mkdir -p "$S/assets/gemelo" "$S/agendar" "$S/privacidad"; cp $C/projects/analizodatos-landing/gemelo/privacidad/index.html "$S/privacidad/index.html"; cp $C/projects/analizodatos-landing/gemelo/{widget.js,config.js} "$S/assets/gemelo/"; cp $C/projects/analizodatos-landing/gemelo/agendar/index.html "$S/agendar/index.html"
python3 - "$S/index.html" <<'PY'
import sys; p=sys.argv[1]; s=open(p).read(); tag='<script src="/assets/gemelo/config.js"></script><script src="/assets/gemelo/widget.js" defer></script>'
if "gemelo/widget.js" not in s: s=s.replace("</body>", tag+"</body>",1); open(p,"w").write(s)
PY
for pair in "metodo-sc:pieza-final-metodo-sc" "metodo-sc-embed:pieza-final-metodo-sc-embed" "scrolling:pieza-scrolling"; do d=${pair%%:*}; s=${pair##*:}; mkdir -p "$S/$d"; rsync -a --exclude .htaccess $C/artifacts/scrollytelling-recorrido/$s/ "$S/$d/"; done
# piloto: fondos del recorrido hechos con HyperFrames, en ruta aparte y sin indexar (comparar con /scrolling/)
mkdir -p "$S/scrolling-hf"; rsync -a --exclude .htaccess $C/artifacts/scrollytelling-recorrido/pieza-scrolling-hf/ "$S/scrolling-hf/"
mkdir -p "$S/scrolling-an"; rsync -a --exclude .htaccess $C/artifacts/scrollytelling-recorrido/pieza-scrolling-an/ "$S/scrolling-an/"
mkdir -p "$S/scrolling-flow-mov"; rsync -a --exclude .htaccess $C/artifacts/scrollytelling-recorrido/pieza-scrolling-flow-mov/ "$S/scrolling-flow-mov/"
[ -d $C/artifacts/scrollytelling-recorrido/pieza-scrolling-flow-fijo ] && { mkdir -p "$S/scrolling-flow"; rsync -a --exclude .htaccess $C/artifacts/scrollytelling-recorrido/pieza-scrolling-flow-fijo/ "$S/scrolling-flow/"; }
mkdir -p "$S/blog"; rsync -a $C/projects/blog-analizodatos/out/ "$S/blog/"
mkdir -p "$S/6M-IA"; cp $C/projects/infografias-linkedin/research/6m-ia/web/framework.html "$S/6M-IA/index.html"
mkdir -p "$S/webinar-openclaw-codex" "$S/webinar-openclaw-codex-slides"
cp $C/taller-openclaw-codex-web/index.html $C/taller-openclaw-codex-web/favicon.png "$S/webinar-openclaw-codex/"
cp $C/taller-openclaw-codex-web/deck-v2.html "$S/webinar-openclaw-codex-slides/index.html"
for d in webinar-openclaw-codex webinar-openclaw-codex-slides; do cp $C/taller-openclaw-codex-web/qr-linkedin-tinta.png "$S/$d/qr-linkedin.png"; done
mkdir -p "$S/consigue-empleo-remoto" "$S/workflow" "$S/tier-list-ai-ecosystem" "$S/fonts" "$S/brand"
cp $C/projects/consigue-empleo-remoto/index.html "$S/consigue-empleo-remoto/"; cp $C/projects/workflow-page/index.html "$S/workflow/"
cp $C/projects/infografias-linkedin/infografias/tier-list-ia/index.html "$S/tier-list-ai-ecosystem/"
rsync -a $C/projects/infografias-linkedin/fonts/ "$S/fonts/"; cp $C/projects/infografias-linkedin/brand/manu-linkedin.jpg "$S/brand/"
mkdir -p "$S/onboarding-claude"; rsync -a --exclude api --exclude data --exclude '*.php' --exclude groq.key $C/../Projects/claudecode-onboarding/out/ "$S/onboarding-claude/"
mkdir -p "$S/agente-de-ventas"; cp $C/proyectos/vende-ia/docs/stack.html "$S/agente-de-ventas/index.html"; cp $C/proyectos/vende-ia/docs/manu-presnap-orange.mp4 "$S/agente-de-ventas/"
printf '/vende-ia https://vende-ai.analizodatos.com/vende-ia 302\n/vende-ia/ https://vende-ai.analizodatos.com/vende-ia 302\n/index-scroll / 301\n/metodo-sc-fix /metodo-sc 301\n' > "$S/_redirects"
printf '/*/d/*\n  Cache-Control: public, max-age=31536000, immutable\n/scrolling-hf/*\n  X-Robots-Tag: noindex\n/scrolling-an/*\n  X-Robots-Tag: noindex\n/scrolling-flow/*\n  X-Robots-Tag: noindex\n/scrolling-flow-mov/*\n  X-Robots-Tag: noindex\n' > "$S/_headers"
echo "armado en $S ($(du -sh "$S" | cut -f1), $(find "$S" -type f | wc -l) archivos)"
[ "${1:-}" = "--solo-armar" ] && exit 0
export CLOUDFLARE_ACCOUNT_ID=f34c339046f4d904e327032ba505c82e CLOUDFLARE_EMAIL=$(cat ~/.config/cloudflare/email) CLOUDFLARE_API_KEY=$(cat ~/.config/cloudflare/api_key)
cd ~/clawd/projects/analizodatos-landing && wrangler pages deploy "$S" --project-name analizodatos-landing --branch main --commit-dirty=true 2>&1 | tail -3
