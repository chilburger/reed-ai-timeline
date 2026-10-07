"""Turn WIKIDATA-MATCHES.json (card -> Wikidata items with LC authority IDs) into LC-HEADINGS.json.
For each high-confidence LC ID: read the authorized heading from id.loc.gov, then keep it only if an exact
subject search for it in Reed's catalog (Primo VE guest search) returns at least one record.
Usage: python build_lc_headings.py   (caches lookups in LC-CACHE.json)"""
import io, json, os, sys, time, urllib.parse, urllib.request
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'reed-ai-timeline/0.1 (library research)'}
M = json.load(io.open('WIKIDATA-MATCHES.json', encoding='utf8'))
CACHE = json.load(io.open('LC-CACHE.json', encoding='utf8')) if os.path.exists('LC-CACHE.json') else {}

def get(url, headers=None):
    for tries in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=dict(UA, **(headers or {}))), timeout=30).read().decode('utf8')
        except Exception:
            time.sleep(2 + 3 * tries)
    return ''

def heading(lcid):
    kind = 'subjects' if lcid.startswith('sh') else 'names'
    t = get('https://id.loc.gov/authorities/%s/%s.madsrdf.json' % (kind, lcid))
    try:
        for n in json.loads(t):
            if n.get('@id', '').endswith('/' + lcid):
                for k, v in n.items():
                    if k.endswith('authoritativeLabel'):
                        return v[0]['@value']
    except ValueError:
        pass
    return None

H = 'https://suny-fre.primo.exlibrisgroup.com'; INST = '01SUNY_FRE'; VID = INST + ':' + INST
TOKEN = get(H + '/primaws/rest/pub/institution/' + INST + '/guestJwt?isGuest=true&lang=en&targetUrl=&viewId=' + VID).strip('"')
def hits(head, field='sub'):
    p = {'inst': INST, 'lang': 'en', 'limit': '1', 'offset': '0', 'q': field + ',exact,' + head, 'scope': 'MyInst_and_CI',
         'skipDelivery': 'Y', 'sort': 'rank', 'tab': 'Everything', 'vid': VID, 'pcAvailability': 'false'}
    time.sleep(0.4)
    t = get(H + '/primaws/rest/pub/pnxs?' + urllib.parse.urlencode(p, safe=',:'), {'Authorization': 'Bearer ' + TOKEN})
    try:
        return json.loads(t)['info']['total']
    except (ValueError, KeyError):
        return -1

out = {}
for title, ents in M.items():
    for e in ents:
        if e.get('confidence') != 'high' or not e.get('lc'):
            continue
        c = CACHE.get(e['lc'])
        if c is None:
            h = heading(e['lc'])
            c = {'heading': h, 'hits': hits(h) if h else 0}
            CACHE[e['lc']] = c
            io.open('LC-CACHE.json', 'w', encoding='utf8').write(json.dumps(CACHE, ensure_ascii=False, indent=1))
        if c['heading'] and c['hits'] <= 0 and e.get('role') == 'person' and 'by' not in c:
            c['by'] = hits(c['heading'], 'creator')
            io.open('LC-CACHE.json', 'w', encoding='utf8').write(json.dumps(CACHE, ensure_ascii=False, indent=1))
        print(c['hits'], c.get('by', ''), '|', title[:45], '|', c['heading'])
        if c['heading'] and c['hits'] > 0:
            out.setdefault(title, []).append({'label': e['label'], 'heading': c['heading'], 'qid': e['qid'], 'field': 'sub', 'hits_fre': c['hits']})
        elif c['heading'] and c.get('by', 0) > 0:
            out.setdefault(title, []).append({'label': e['label'], 'heading': c['heading'], 'qid': e['qid'], 'field': 'creator', 'hits_fre': c['by']})
io.open('LC-HEADINGS.json', 'w', encoding='utf8').write(json.dumps(out, ensure_ascii=False, indent=1))
print('cards with LC headings:', len(out), '| headings:', sum(len(v) for v in out.values()))
