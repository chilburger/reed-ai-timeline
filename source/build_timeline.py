"""Build the timeline widget (data inline) and a local preview page.
Reads TIMELINE-CONTENT.json if present, else PLACEHOLDER from the Module 1 fact-check table (no images)."""
import io, json, os, re
os.chdir(os.path.dirname(os.path.abspath(__file__)))
src = 'TIMELINE-CONTENT.json' if os.path.exists('TIMELINE-CONTENT.json') else 'placeholder.json'
data = json.load(io.open(src, encoding='utf8'))
MAP = [('Pascal', ['1642']), ('Frankenstein', ['1818']), ('Babbage', ['1837']), ('Lovelace', ['1843']), ('R.U.R.', ['1920']),
       ('Metropolis', ['1927']), ('Asimov', ['1942']), ('McCulloch', ['1943', '1958']), ('Wiener', ['1948']), ('imitation game', ['1950']),
       ('Hopper', ['1952']), ('is coined', ['1955']), ('Jetsons', ['1962']), ('DENDRAL', ['1965']), ('ELIZA', ['1966']), ('HAL 9000', ['1968']),
       ('AARON', ['1973']), ('Weizenbaum', ['1976']), ('Terminator', ['1984']), ('Vinge', ['1993-vinge']), ('Techno Trousers', ['1993']),
       ('Deep Blue', ['1997']), ('self-driving', ['2009-selfdriving']), ('ImageNet', ['2009']), ('Watson', ['2011']),
       ('Voice assistants', ['2011-siri']), ('Her shows', ['2013']), ('GANs', ['2014']), ('Superintelligence', ['2014-bostrom']),
       ('AlphaGo', ['2016']), ('transformer', ['2017']), ('Gender Shades', ['2018', '2020:video']), ('GPT-3', ['2020:nyt']),
       ('AlphaFold', ['2021-alphafold']), ('ChatGPT launches', ['2022']), ('Norbot', ['2024']), ('AI Act', ['2024-eu-ai-act']),
       ('Nobel', ['2024-nobel']), ('vibe coding', ['2025:nyt'])]
if os.path.exists('COLLECTION-LINKS.json'):
    links = json.load(io.open('COLLECTION-LINKS.json', encoding='utf8'))
    used = set()
    for d in data:
        d['reed'] = []
        for key, keys in MAP:
            if key.lower() in d['title'].lower():
                for k in keys:
                    k, _, kind = k.partition(':')
                    d['reed'] += [x for x in links.get(k, []) if not kind or x['kind'] == kind]
                    used.add(k)
                break
        d['reed'] = d['reed'][:3]
    print('reed links on', sum(1 for d in data if d['reed']), 'cards; unused keys:', sorted(set(links) - used))
if os.path.exists('COLLECTION-LINKS-2.json'):
    links2 = json.load(io.open('COLLECTION-LINKS-2.json', encoding='utf8'))
    for d in data:
        items = links2.get(d['title'])
        if items:
            d['reed'] = [dict(x, url=x.get('stable') or x['url']) for x in items][:3]
    if os.path.exists('COLLECTION-LINKS-3.json'):
        links3 = json.load(io.open('COLLECTION-LINKS-3.json', encoding='utf8'))
        for d in data:
            extra = [dict(x, url=x.get('stable') or x['url']) for x in links3.get(d['title'], [])]
            if extra:
                d['reed'] = (d.get('reed') or []) + extra[:2]
    print('reed links (v2) on', sum(1 for d in data if d.get('reed')), 'cards')
if os.path.exists('SEARCH-TERMS.json'):
    terms = json.load(io.open('SEARCH-TERMS.json', encoding='utf8'))
    for d in data:
        if terms.get(d['title']):
            d['search'] = terms[d['title']][:3]
# Christina's rule (2026-10-06): a card is shown only if it has a Reed collection citation we can link to.
REQUIRE_REED = True
if REQUIRE_REED:
    dropped = [d['title'] for d in data if not d.get('reed') and not d.get('keep')]
    data = [d for d in data if d.get('reed') or d.get('keep')]
    io.open('CARDS-WITHOUT-REED.txt', 'w', encoding='utf8').write(chr(10).join(dropped))
    print('hidden (no Reed citation):', len(dropped))
data.sort(key=lambda d: (int(d['year']), (str(d.get('date') or d['year']) + '-00-00')[:10]))
import base64, qrcode, qrcode.image.svg
for fname in ('CULTURE-ENRICH-APPROVED.json', 'SONGS-ENRICH.json', 'NEW-ENRICH.json', 'BATCH-ENRICH.json'):
    if os.path.exists(fname):
        enr = json.load(io.open(fname, encoding='utf8'))
        for d in data:
            e = enr.get(d['title'])
            if e:
                for k in ('quotes', 'reading', 'reading_src', 'read_free', 'listen', 'audio'):
                    if e.get(k):
                        d[k] = e[k]
for d in data:
    L = d.get('listen')
    if L and L.get('spotify'):
        url = L['spotify']
        q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_L, border=1)
        q.add_data(url); q.make(fit=True); m = q.get_matrix(); n = len(m)
        path = ''.join('M%d %dh1v1h-1z' % (x, y) for y, row in enumerate(m) for x, v in enumerate(row) if v)
        svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 %d %d' shape-rendering='crispEdges'><path d='%s'/></svg>" % (n, n, path)
        L['qr'] = 'data:image/svg+xml,' + svg.replace('<', '%3C').replace('>', '%3E').replace('#', '%23')
widget = io.open('ail-timeline-widget.html', encoding='utf8').read()
KEEP_REED = ('kind', 'title', 'by', 'note', 'url')
for d in data:
    d['reed'] = [{k: x[k] for k in KEEP_REED if x.get(k)} for x in d.get('reed') or []]
    if d.get('image') and not d['image'].get('src'):
        d['image'] = None
    for k in [k for k, v in d.items() if v in (None, '', [], {})]:
        del d[k]
blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
inject = '<script>window.AIL_TL_DATA=' + blob + ';</script>\n<script>\n(function(){'
assert widget.count('<script>\n(function(){') == 1
final = widget.replace('<script>\n(function(){', inject, 1)
io.open('ail-timeline-widget-final.html', 'w', encoding='utf8').write(final)
group = io.open('../ail-group-block.html', encoding='utf8').read()
edit = io.open('../ail-edit-block.html', encoding='utf8').read()
ux = io.open('../ail-ux-block.html', encoding='utf8').read()
preview = ('<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
           '<title>Timeline preview</title>'
           '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&family=Source+Serif+4:wght@600;700&display=swap">'
           '<style>body{margin:0;background:#f6f7fb;padding:24px 16px}</style>' + group + edit + ux + '</head><body>'
           + final + '</body></html>')
io.open('preview.html', 'w', encoding='utf8').write(preview)
print(src, len(data), 'items;', sum(1 for d in data if d.get('image') and d['image'].get('src')), 'with images; widget', len(final), 'chars')

# ---- Publish split files to the reed-ai-timeline project (dist/: css, js, data, embed snippet) ----
import re as _re
REPO = os.path.abspath(os.path.join('..', '..', '..', 'reed-ai-timeline'))
if os.path.isdir(REPO):
    BASE = 'https://chilburger.github.io/reed-ai-timeline/dist/'
    css = _re.search(r'<style>(.*?)</style>', widget, _re.S).group(1)
    js_full = _re.search(r'<script>\s*\(function\(\)\{(.*)\}\)\(\);\s*</script>', widget, _re.S).group(1)
    loader = ("(function(){var root=document.getElementById('ail-tl');if(!root||window.AIL_TL_LOADED)return;window.AIL_TL_LOADED=1;"
              "function MAIN(){" + js_full + "}\n"
              "if(window.AIL_TL_DATA){MAIN();return;}"
              "fetch(root.getAttribute('data-src')||'" + BASE + "timeline-data.json').then(function(r){return r.json();})"
              ".then(function(d){window.AIL_TL_DATA=d;MAIN();})"
              ".catch(function(){root.insertAdjacentHTML('afterbegin','<p style=\"padding:12px\">The timeline could not load. The full list of milestones is below.</p>');});})();\n")
    markup = _re.sub(r'<style>.*?</style>', '', widget, flags=_re.S)
    markup = _re.sub(r'<script>.*?</script>', '', markup, flags=_re.S)
    markup = markup.replace('<section class="ail-tl" id="ail-tl"', '<section class="ail-tl" id="ail-tl" data-src="' + BASE + 'timeline-data.json"', 1)
    embed = markup.rstrip()
    embed = embed[:embed.rfind('</div>')] + ('<link rel="stylesheet" href="' + BASE + 'ail-timeline.css">\n'
             '<script src="' + BASE + 'ail-timeline.js" defer></script>\n</div>\n')
    io.open(os.path.join(REPO, 'dist', 'ail-timeline.css'), 'w', encoding='utf8').write(css.strip() + '\n')
    io.open(os.path.join(REPO, 'dist', 'ail-timeline.js'), 'w', encoding='utf8').write(loader)
    io.open(os.path.join(REPO, 'dist', 'timeline-data.json'), 'w', encoding='utf8').write(json.dumps(data, ensure_ascii=False, separators=(',', ':')))
    io.open(os.path.join(REPO, 'dist', 'embed.html'), 'w', encoding='utf8').write(embed)
    for f in ('TIMELINE-CONTENT.json', 'build_timeline.py', 'ail-timeline-widget.html', 'merge_batch.py'):
        io.open(os.path.join(REPO, 'source', f), 'w', encoding='utf8').write(io.open(f, encoding='utf8').read())
    print('published dist to', REPO, '| embed', len(embed), 'chars | data', os.path.getsize(os.path.join(REPO, 'dist', 'timeline-data.json')), 'bytes')
