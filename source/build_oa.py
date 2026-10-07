"""Find free, legal full text for the Reed items and free-reading links on each card (OpenAlex, no key).
For every Reed item with a DOI it asks OpenAlex for open-access copies, prefers repository copies with an
open license, and checks whether the copy's server allows it to be shown inside another page (no
X-Frame-Options or frame-ancestors block). Free-reading links (read_free) get the same frame check.
Writes OA-LINKS.json: {url_of_item: {"pdf","page","license","status","host","embed"}}. Cached in OA-CACHE.json.
Licensed items are left alone: they open through the library sign-in in a new tab."""
import io, json, os, re, sys, time, urllib.parse, urllib.request
os.chdir(os.path.dirname(os.path.abspath(__file__)))
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
UA = {'User-Agent': 'Mozilla/5.0 (reed-ai-timeline open-access check)'}
data = json.load(io.open(os.path.join('..', '..', '..', 'reed-ai-timeline', 'dist', 'timeline-data.json'), encoding='utf8'))
CACHE = json.load(io.open('OA-CACHE.json', encoding='utf8')) if os.path.exists('OA-CACHE.json') else {}

N = [0]
def save_cache(force=False):
    N[0] += 1
    if force or N[0] % 25 == 0:
        io.open('OA-CACHE.json', 'w', encoding='utf8').write(json.dumps(CACHE, ensure_ascii=False))

def fetch(url, method='GET'):
    req = urllib.request.Request(url, headers=dict(UA, Range='bytes=0-2047'), method=method)
    try:
        r = urllib.request.urlopen(req, timeout=25)
        return r.status, dict((k.lower(), v) for k, v in r.headers.items()), r.read(2048)
    except urllib.error.HTTPError as e:
        return e.code, dict((k.lower(), v) for k, v in (e.headers or {}).items()), b''
    except Exception:
        return 0, {}, b''

def frameable(url):
    """True only when the server answers and sends no header that blocks showing it inside another site."""
    key = 'frame:' + url
    if key in CACHE:
        return CACHE[key]
    st, h, body = fetch(url)
    ok = 200 <= st < 300 or st == 206
    xfo = h.get('x-frame-options', '').lower()
    csp = h.get('content-security-policy', '').lower()
    fa = re.search(r'frame-ancestors([^;]*)', csp)
    blocked = bool(xfo) or (fa is not None and '*' not in fa.group(1))
    CACHE[key] = ok and not blocked
    save_cache(); time.sleep(0.3)
    return CACHE[key]

def doi_of(url):
    m = re.search(r'doi\.org/(10\.[^\s?#]+)', urllib.parse.unquote(url or ''))
    return m.group(1) if m else None

def openalex(doi):
    key = 'oa:' + doi.lower()
    if key not in CACHE:
        try:
            CACHE[key] = json.load(urllib.request.urlopen(urllib.request.Request('https://api.openalex.org/works/doi:' + urllib.parse.quote(doi), headers=UA), timeout=25))
        except Exception:
            CACHE[key] = None
        save_cache(); time.sleep(0.15)
    return CACHE[key]

def best(work):
    if not work or not work.get('open_access', {}).get('is_oa'):
        return None
    locs = [l for l in work.get('locations') or [] if l.get('is_oa') and (l.get('pdf_url') or l.get('landing_page_url'))]
    # prefer repository copies (they usually allow framing), then openly licensed, then anything with a PDF
    locs.sort(key=lambda l: ((l.get('source') or {}).get('type') != 'repository', not (l.get('license') or '').startswith('cc'), not l.get('pdf_url')))
    for l in locs:
        for u in [l.get('pdf_url'), l.get('landing_page_url')]:
            if u and frameable(u):
                return {'read': u, 'page': l.get('landing_page_url') or u, 'license': l.get('license'), 'status': work['open_access'].get('oa_status'),
                        'host': (l.get('source') or {}).get('display_name') or urllib.parse.urlparse(u).netloc, 'embed': True}
    l = locs[0] if locs else None
    if not l:
        return None
    return {'read': l.get('pdf_url') or l.get('landing_page_url'), 'page': l.get('landing_page_url'), 'license': l.get('license'),
            'status': work['open_access'].get('oa_status'), 'host': (l.get('source') or {}).get('display_name'), 'embed': False}

out = {}
items = [(d['title'], x) for d in data for x in d.get('reed') or []]
print('reed items', len(items), '| with DOI', sum(1 for _, x in items if doi_of(x['url'])))
for t, x in items:
    doi = doi_of(x['url'])
    if doi and x['url'] not in out:
        b = best(openalex(doi))
        if b:
            out[x['url']] = b
            print('OA' if b['embed'] else 'oa', b['status'], b['host'], '|', x['title'][:60])
for d in data:
    rf = d.get('read_free')
    if isinstance(rf, str):
        rf = {'url': rf}
    if rf and rf.get('url') and rf['url'] not in out:
        out[rf['url']] = {'read': rf['url'], 'page': rf['url'], 'license': None, 'status': 'free', 'host': urllib.parse.urlparse(rf['url']).netloc, 'embed': frameable(rf['url'])}
save_cache(True)
io.open('OA-LINKS.json', 'w', encoding='utf8').write(json.dumps(out, ensure_ascii=False, indent=1))
print('free copies:', len(out), '| can show inside the timeline:', sum(1 for v in out.values() if v['embed']))
