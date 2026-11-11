#!/usr/bin/env python3
"""Worldbook 1.7.0 : retire le tutoriel, la carte stellaire et Novastella (partis dans Carte Stellaire Manhwa)
et embellit la page d'introduction. Source : _wb_orig/1.6.1/app/worldbook.html → app/worldbook.html"""
import re, json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT.parent / '_wb_orig' / '1.6.1' / 'app' / 'worldbook.html'
L = SRC.read_text(encoding='utf-8').split('\n')

def idx(prefix, start=0):
    for i in range(start, len(L)):
        if L[i].startswith(prefix): return i
    raise SystemExit('introuvable : ' + prefix)

drop = set()
def drop_range(a, b): drop.update(range(a, b + 1))   # indices 0-based inclus

# 1. CSS de la carte (cm-css) et polices/Novastella (cm-fonts)
a = idx('</style><style id="cm-css">'); b = idx('</style><style id="polish-css">'); drop_range(a, b - 1)
a = idx('</style><style id="cm-fonts">'); b = idx('</style></head>'); drop_range(a, b - 1)
# 2. bouton « ? » et calque du tutoriel
drop.add(idx('<button id="wb-help"'))
a = idx('<div id="wb-tuto"'); b = idx('</div>', a); drop_range(a, b)
# 3. rapports des mondes mineurs (overlay)
a = idx('<div class="qz-overlay" id="cm-rep-ov"'); b = idx('</div>', a); drop_range(a, b)
# 4. scripts : données des mondes mineurs + rapports/infobulles, tutoriel, vue carte
a = idx('/* ── Données mondes mineurs ── */'); b = idx('function cmTipHide()'); drop_range(a, b)
a = idx('/* ── v11 : tutoriel d\'accueil'); b = idx("document.addEventListener('click',function(e){ if(e.target.closest('#wb-full,#ctb-map", a); drop_range(a, b)
a = idx('/* ── Vue Atlas : liste / carte ── */'); b = idx('function covView(v){', a)
c = b
while not L[c].startswith('}'): c += 1
drop_range(a, c)
# 5. moteur de la carte : cm-moons, nova-js, cm-config, cm-engine
a = idx('<script id="cm-moons">'); b = idx('</script><script id="polish-js">'); drop_range(a, b - 1)
L[b] = L[b].replace('</script><script id="polish-js">', '<script id="polish-js">', 1)

out = [l for i, l in enumerate(L) if i not in drop]
s = '\n'.join(out)

def rep(a, b, count=1, regex=False):
    global s
    n = len(re.findall(a, s)) if regex else s.count(a)
    if n != count: raise SystemExit(f'{n} occurrence(s) au lieu de {count} : {a[:90]}')
    s = re.sub(a, b, s) if regex else s.replace(a, b)

# données des mondes mineurs en tête du script principal
rep(r'<script id="cm-data">var CM_DATA=\{.*?\};</script><script>', '<script>', regex=True)
# page de garde : plus de bascule liste / carte (ancre cachée gardée pour le bandeau de chiffres)
rep(r'<div class="cov-toggle">.*?</div><div id="cov-map"></div>', '<div class="cov-toggle cov-anchor"></div>', regex=True)
# Nova : section « Plan de Novastella » retirée
rep(r'<div class="sec sec-map"><div class="sec-lbl"><span class="lbl-ic">⌖</span>Plan de Novastella</div>.*?</p></div></div>', '', regex=True)
# démarrage : plus de tutoriel ; ouverture directe d'un monde (?w=)
rep("  show('cover');\n  wbTutoAuto();", "  var _w=(location.search.match(/[?&]w=([a-z]+)/)||[])[1]; show(_w&&W.indexOf(_w)>=0?_w:'cover');")
# bandeau de chiffres : valeurs figées (les données de la carte ne sont plus dans le worldbook)
U = json.loads((ROOT.parent / '_wb_orig' / '1.6.1' / 'data' / 'universe.json').read_text(encoding='utf-8'))
nSys = sum(len(g['systems']) for g in U['gal'].values()); nPl = sum(len(y['planets']) for g in U['gal'].values() for y in g['systems']) + 1
rep("try{ Object.keys(CM_UNIVERSE.gal).forEach(function(k){ CM_UNIVERSE.gal[k].systems.forEach(function(s){ nSys++; nPl+=s.planets.length; }); }); nPl+=1; pop=CM_UNIVERSE.netpop||0; }catch(e){}",
    f"nPl={nPl}; nSys={nSys}; pop={int(U.get('netpop') or 0)};")
# messages de l'hôte Foundry : ouvrir un monde précis
css = (ROOT / 'src' / 'v17.css').read_text(encoding='utf-8')
js = (ROOT / 'src' / 'v17.js').read_text(encoding='utf-8')
rep('</body></html>', f'<style id="wb-v17">\n{css}\n</style>\n<script id="wb-v17-js">\n{js}\n</script>\n</body></html>')
for bad in ['wbTuto', 'covView(', 'CM_MAP', 'id="cov-map"', 'CM_DATA', 'NOVA_SURFACE', 'WB_AUTOFULL']:
    if bad in s: print('ATTENTION : reste', bad, s.count(bad))
(ROOT / 'app' / 'worldbook.html').write_text(s, encoding='utf-8')
print('worldbook.html', len(s.encode('utf-8')) // 1024, 'Ko')
