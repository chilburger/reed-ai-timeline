"""Merge a card batch file ({"cards","enrich","reed","search"}) into the timeline sources.
Usage: python merge_batch.py CARDS-A14.json"""
import io, json, sys, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
B = json.load(io.open(sys.argv[1], encoding='utf8'))
def load(p, default):
    return json.load(io.open(p, encoding='utf8')) if os.path.exists(p) else default
def save(p, obj):
    io.open(p, 'w', encoding='utf8').write(json.dumps(obj, ensure_ascii=False, indent=1))
T = load('TIMELINE-CONTENT.json', [])
have = {x['title'].lower() for x in T}
added = [c for c in B.get('cards', []) if c['title'].lower() not in have]
T += added
T.sort(key=lambda x: (int(x['year']), (str(x.get('date') or x['year']) + '-00-00')[:10]))
save('TIMELINE-CONTENT.json', T)
E = load('BATCH-ENRICH.json', {}); E.update(B.get('enrich', {}))
for t, h in B.get('headlines', {}).items(): E.setdefault(t, {})['headlines'] = h
save('BATCH-ENRICH.json', E)
L = load('COLLECTION-LINKS-2.json', {}); L.update(B.get('reed', {})); save('COLLECTION-LINKS-2.json', L)
S = load('SEARCH-TERMS.json', {}); S.update(B.get('search', {})); save('SEARCH-TERMS.json', S)
print('added', len(added), 'cards; total', len(T))
