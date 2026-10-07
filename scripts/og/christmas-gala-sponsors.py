# Generates public/images/events/christmas-gala-sponsors-og-{en,es}.jpg (1200x630).
# Usage: python3 scripts/og/christmas-gala-sponsors.py, then render each og-<locale>.html with
# headless Chrome (--window-size=1200,630 --screenshot) and convert to JPEG (sips -s format jpeg).
# Edit dates/prices here if they change in src/data/christmasGala.ts.
import random, sys
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
copy = {
  "en": dict(lang="en", title="Sponsor our<br>Christmas Gala", sub="Put your business in front of 100+ guests &mdash; A&amp;J clients and their families.",
             date="Sat &middot; Dec 5, 2026", place="Virginia Beach", deadline="Applications close Nov 28",
             video="Video produced by A&amp;J from $750", head="Sponsor packages",
             tiers=[("Gold","$2,000"),("Silver","$1,250"),("Bronze","$750"),("Community","$350")]),
  "es": dict(lang="es", title="Patrocina nuestra<br>Gala de Navidad", sub="Presenta tu negocio ante m&aacute;s de 100 invitados: clientes de A&amp;J y sus familias.",
             date="S&aacute;b &middot; 5 dic 2026", place="Virginia Beach", deadline="Solicitudes hasta el 28 nov",
             video="Video producido por A&amp;J desde $750", head="Paquetes de sponsor",
             tiers=[("Gold","$2,000"),("Silver","$1,250"),("Bronze","$750"),("Community","$350")]),
}
random.seed(7)
flakes = "".join(
  f'<circle cx="{random.uniform(0,1200):.0f}" cy="{random.uniform(0,630):.0f}" r="{random.choice([1,1.2,1.6,2,2.4]):.1f}" fill="#fff7f5" opacity="{random.uniform(.18,.6):.2f}"/>'
  for _ in range(90))
for key, c in copy.items():
    rows = "".join(
      f'<div class="row{" gold" if i==0 else ""}"><span>{n}</span><b>{p}</b></div>' for i,(n,p) in enumerate(c["tiers"]))
    html = f"""<!doctype html><html lang="{c['lang']}"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,600;1,500&family=Montserrat:wght@500;600;700&display=block" rel="stylesheet">
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1200px;height:630px;overflow:hidden}}
body{{position:relative;background:#0a1321;color:#fff7f5;font-family:Montserrat,sans-serif}}
.glow{{position:absolute;inset:0;background:radial-gradient(ellipse 55% 70% at 80% 40%,rgba(199,162,96,.22),transparent 70%),radial-gradient(ellipse 60% 80% at 0% 110%,rgba(52,74,93,.6),transparent 70%)}}
svg.snow{{position:absolute;inset:0}}
.frame{{position:absolute;inset:24px;border:1px solid rgba(199,162,96,.35);border-radius:14px}}
.left{{position:absolute;left:72px;top:64px;width:640px}}
.logo{{height:76px}}
h1{{margin-top:26px;font-family:'EB Garamond',serif;font-weight:600;font-size:{86 if key=='en' else 80}px;line-height:.98;letter-spacing:-.02em}}
.sub{{margin-top:22px;font-size:25px;line-height:1.42;color:#d2dadf;max-width:600px}}
.facts{{position:absolute;left:72px;bottom:60px;display:flex;gap:12px;align-items:center}}
.pill{{border-radius:999px;padding:11px 20px;font-size:18px;white-space:nowrap;font-weight:600;background:#22354a;color:#fff7f5}}
.pill.gold{{background:#c7a260;color:#0a1321}}
.card{{position:absolute;right:64px;top:70px;width:392px;border-radius:16px;background:#102037;box-shadow:0 20px 25px -5px rgba(0,0,0,.35),inset 0 0 0 1px rgba(199,162,96,.45);padding:28px 30px 26px}}
.card h2{{font-size:16px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#96a7b1}}
.row{{display:flex;justify-content:space-between;align-items:baseline;padding:13px 0;border-top:1px solid #22354a;font-size:22px;font-weight:600;color:#d2dadf}}
.card h2+.row{{margin-top:14px}}
.row b{{font-family:'EB Garamond',serif;font-size:36px;font-weight:600;color:#fff7f5;font-variant-numeric:tabular-nums}}
.row.gold span{{color:#c7a260}} .row.gold b{{color:#c7a260;font-size:42px}}
.video{{margin-top:12px;padding-top:16px;border-top:1px solid #22354a;font-family:'EB Garamond',serif;font-style:italic;font-weight:500;font-size:21px;line-height:1.25;color:#e9d8d0;white-space:nowrap}}
</style></head><body>
<div class="glow"></div>
<svg class="snow" width="1200" height="630">{flakes}</svg>
<div class="frame"></div>
<div class="left">
  <img class="logo" src="file://{ROOT}/public/images/logo-white_2.webp" alt="">
  <h1>{c['title']}</h1>
  <p class="sub">{c['sub']}</p>
</div>
<div class="facts"><span class="pill">{c['date']} &middot; {c['place']}</span><span class="pill gold">{c['deadline']}</span></div>
<div class="card"><h2>{c['head']}</h2>{rows}<p class="video">{c['video']}</p></div>
</body></html>"""
    open(f"og-{key}.html","w").write(html)
print("ok")
