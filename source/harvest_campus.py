"""Find a campus's own catalog records for every timeline card (Primo VE guest search, no login).

For each card it looks up (1) the works the card cites, by title and author, and (2) the card's tested
search terms, and keeps only records that campus has (on the shelf, or online with full text).
Writes campus/<INST>.json next to the timeline data; the embed loads it with data-campus.

Usage:
  python harvest_campus.py --inst 01SUNY_GEN --name "Milne Library" --host https://suny-gen.primo.exlibrisgroup.com
Optional: --vid (default INST:INST), --search-label (default "the catalog"), --limit N (cards, for a test run)
Catalogs do not allow browsers on other sites to search them, so this runs here, not in the reader's browser.
Rerun it each term (or after new cards) to refresh.
"""
import argparse, datetime, io, json, os, time, urllib.parse, urllib.request
os.chdir(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--inst', required=True); ap.add_argument('--name', required=True); ap.add_argument('--host', required=True)
ap.add_argument('--vid'); ap.add_argument('--search-label', default='the catalog'); ap.add_argument('--limit', type=int, default=0)
DIST = os.path.join('..', '..', '..', 'reed-ai-timeline', 'dist')
ap.add_argument('--out', default=os.path.join(DIST, 'campus'))
A = ap.parse_args()
VID = A.vid or A.inst + ':' + A.inst
HOST = A.host.rstrip('/')
KIND = {'book': 'book', 'books': 'book', 'video': 'video', 'videos': 'video', 'article': 'article', 'review': 'review',
        'book_chapter': 'chapter', 'dissertation': 'dissertation', 'newspaper_article': 'news', 'reference_entry': 'reference',
        'conference_proceeding': 'article', 'audio': 'audio', 'audios': 'audio', 'score': 'score', 'scores': 'score'}
HAS = ('available_in_library', 'available_in_institution', 'available_in_maininstitution', 'fulltext', 'fulltext_linktorsrc',
       'fulltext_unknown', 'not_restricted', 'check_holdings', 'fulltext_multiple')

def get(url, token=None):
    req = urllib.request.Request(url, headers={'User-Agent': 'reed-ai-timeline harvest (library research tool)'})
    if token: req.add_header('Authorization', 'Bearer ' + token)
    for tries in range(3):
        try:
            return urllib.request.urlopen(req, timeout=30).read().decode('utf8')
        except Exception:
            time.sleep(2 + tries * 3)
    return ''

TOKEN = get(HOST + '/primaws/rest/pub/institution/' + A.inst + '/guestJwt?isGuest=true&lang=en&targetUrl=&viewId=' + urllib.parse.quote(VID)).strip('"')
assert TOKEN.startswith('ey'), 'no guest token: check --host, --inst and --vid'

def search(q, field='any', scope='MyInst_and_CI', n=5):
    p = {'blendFacetsSeparately': 'false', 'disableCache': 'false', 'getMore': '0', 'inst': A.inst, 'lang': 'en', 'limit': str(n),
         'newspapersActive': 'false', 'offset': '0', 'pcAvailability': 'false', 'q': field + ',contains,' + q, 'qExclude': '', 'qInclude': '',
         'rapido': 'false', 'refEntryActive': 'false', 'rtaLinks': 'true', 'scope': scope, 'skipDelivery': 'N', 'sort': 'rank',
         'tab': 'Everything', 'vid': VID}
    time.sleep(0.4)
    t = get(HOST + '/primaws/rest/pub/pnxs?' + urllib.parse.urlencode(p, safe=',:'), TOKEN)
    try:
        docs = json.loads(t).get('docs', [])
    except ValueError:
        return []
    out = []
    for x in docs:
        av = (x.get('delivery') or {}).get('availability') or []
        if not any(a in HAS for a in av):
            continue
        d = x['pnx']['display']; c = x['pnx']['control']
        docid = (c.get('recordid') or [''])[0]
        ctx = 'L' if x.get('context') == 'L' or docid.startswith('alma') else 'PC'
        by = (d.get('creator') or d.get('contributor') or [''])[0].split('$$')[0]
        out.append({'kind': KIND.get((d.get('type') or [''])[0], 'item'), 'title': (d.get('title') or [''])[0].strip(), 'by': by.strip(),
                    'url': HOST + '/discovery/fulldisplay?docid=' + docid + '&context=' + ctx + '&vid=' + VID})
    return out

def words(s, n=8):
    s = s.split(' : ')[0].split(': ')[0]
    return ' '.join(''.join(ch if ch.isalnum() else ' ' for ch in s).split()[:n])

def norm(s, n=10):
    return ''.join(ch.lower() if ch.isalnum() else ' ' for ch in s).split()[:n]

STOP = {'the', 'a', 'an', 'of', 'and', 'in', 'on', 'to', 'for', 'book', 'review'}
def same(found, cited):
    """True when the found record carries the cited title (main title and subtitle), not just a shared first word."""
    a = [w for w in norm(found, 14) if w not in STOP]; b = [w for w in norm(cited, 10) if w not in STOP]
    if not a or not b: return False
    if len(b) <= 2: return b == a[:len(b)] or ' '.join(b) in ' '.join(a)
    return len(set(a) & set(b)) >= 0.75 * len(set(b))

data = json.load(io.open(os.path.join(DIST, 'timeline-data.json'), encoding='utf8'))
if A.limit: data = data[:A.limit]
items, stats = {}, {'cards': 0, 'cited_found': 0, 'cited_total': 0}
for d in data:
    found, seen = [], set()
    for r in d.get('reed') or []:
        stats['cited_total'] += 1
        q = words(r['title']) + ((' ' + r['by'].split(',')[0].split()[-1]) if r.get('by') and r['by'].split(',')[0].split() else '')
        hits = [h for h in search(q, n=3) if same(h['title'], r['title']) and ' '.join(norm(h['title'])) not in seen]
        if hits:
            h = dict(hits[0], cited=1); found.append(h); seen.update([h['url'], ' '.join(norm(h['title']))]); stats['cited_found'] += 1
    for t in d.get('search') or []:
        if len(found) >= 4: break
        for h in search(t['term'], n=4):
            k = ' '.join(norm(h['title']))
            if h['url'] not in seen and k not in seen and len(found) < 4:
                found.append(h); seen.update([h['url'], k])
    if found:
        items[d['title']] = found; stats['cards'] += 1
    print(len(found), d['title'][:60])
os.makedirs(A.out, exist_ok=True)
out = {'inst': A.inst, 'name': A.name, 'host': HOST, 'vid': VID, 'searchLabel': A.search_label,
       'built': datetime.date.today().isoformat(), 'stats': stats, 'items': items}
io.open(os.path.join(A.out, A.inst + '.json'), 'w', encoding='utf8').write(json.dumps(out, ensure_ascii=False, separators=(',', ':')))
print(A.inst, stats)
