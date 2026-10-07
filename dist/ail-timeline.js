(function(){var root=document.getElementById('ail-tl');if(!root||window.AIL_TL_LOADED)return;window.AIL_TL_LOADED=1;function MAIN(){
  var root=document.getElementById('ail-tl');if(!root||root.getAttribute('data-wired'))return;root.setAttribute('data-wired','1');
  var TOPIC=window.AIL_TL_TOPIC||{};var DATA=(window.AIL_TL_DATA||[]).slice();if(!DATA.length)return;
  /* New milestones from Christina's Google Sheet ("AI Timeline additions (Reed Library)"). Rows marked example or researched are skipped;
     researched rows already live in the data above. The sheet must be shared as "Anyone with the link can view". */
  var SHEET=TOPIC.sheet!=null?TOPIC.sheet:'11GZu6bNznczW5tlxueDwR7oQXf3gJVH0igeJGh3wz28';
  /* another library's own catalog records for each card: data-campus="01SUNY_GEN" (or a URL), built by harvest_campus.py */
  var CAMPUS=null;
  function loadCampus(next){var c=root.getAttribute('data-campus'),done=false,go=function(){if(!done){done=true;next();}};if(!c||!window.fetch)return go();
    var u=/^https?:/.test(c)?c:(root.getAttribute('data-src')||'').replace(/[^\/]*$/,'')+'campus/'+c+'.json';setTimeout(go,4000);
    fetch(u).then(function(r){return r.ok?r.json():null;}).then(function(j){if(j&&j.items)CAMPUS=j;go();}).catch(go);}
  function skey(d){var p=String(d.date||d.year).replace(/^-/,'').split('-');return (+d.year)*10000+(+p[1]||0)*100+(+p[2]||0);}
  function parseCSV(t){var rows=[],row=[],f='',q=false;for(var i=0;i<t.length;i++){var c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i++;}else q=false;}else f+=c;}else if(c==='"')q=true;else if(c===','){row.push(f);f='';}else if(c==='\n'){row.push(f);rows.push(row);row=[];f='';}else if(c!=='\r')f+=c;}if(f||row.length){row.push(f);rows.push(row);}return rows;}
  function fromSheet(t){var R=parseCSV(t);if(R.length<2)return [];var H=R[0].map(function(h){return h.trim().toLowerCase();}),col=function(r,n){var i=H.indexOf(n);return i<0?'':(r[i]||'').trim();};var have={};DATA.forEach(function(d){have[d.title.toLowerCase()]=1;});
    return R.slice(1).map(function(r){var st=col(r,'status').toLowerCase(),y=parseInt(col(r,'year'),10),ti=col(r,'title');if(st==='example'||st==='researched'||!ti||!y||have[ti.toLowerCase()])return null;
      var d={year:y,date:col(r,'date')||String(y),title:ti,track:col(r,'topic').toLowerCase(),text:col(r,'what happened'),why:col(r,'why it mattered'),isNew:true};
      if(col(r,'source link'))d.source={label:'Source',url:col(r,'source link')};if(col(r,'reed link'))d.reed=[{kind:'item',title:'Reed Library item',url:col(r,'reed link')}];if(col(r,"christina's note"))d.musing=col(r,"christina's note");return d;}).filter(Boolean);}
  function start(extra){if(extra&&extra.length){DATA=DATA.concat(extra);DATA.sort(function(a,b){return skey(a)-skey(b);});}loadCampus(boot);}
  var started=false;function once(x){if(started)return;started=true;start(x);}
  if(SHEET&&window.fetch){setTimeout(function(){once([]);},3500);fetch('https://docs.google.com/spreadsheets/d/'+SHEET+'/gviz/tq?tqx=out:csv').then(function(r){return r.ok?r.text():'';}).then(function(t){once(t?fromSheet(t):[]);}).catch(function(){once([]);});}else once([]);
  function boot(){
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cardsEl=root.querySelector('.ail-tl-cards'),trace=root.querySelector('.ail-tl-trace'),lit=root.querySelector('.ail-tl-lit'),pulse=root.querySelector('.ail-tl-pulse');
  var yOut=root.querySelector('.ail-tl-year-out'),yFill=root.querySelector('.ail-tl-year-fill'),eraL=root.querySelector('.ail-tl-era');
  var sr=root.querySelector('.ail-tl-sr'),count=root.querySelector('.ail-tl-count'),pull=root.querySelector('.ail-tl-pull'),pullT=root.querySelector('.ail-tl-pull-t'),back=root.querySelector('.ail-tl-back');
  var gapV=root.querySelector('.ail-tl-gap-v'),gapBar=root.querySelector('.ail-tl-gap-bar i');
  var TRACKS={tech:'Technology',idea:'Ideas & fiction',culture:'Pop culture & art',society:'Society & policy',edu:'Education',suny:'SUNY'};if(TOPIC.tracks)TRACKS=TOPIC.tracks;
  var PROFILE='https://fredonia.libguides.com/prf.php?account_id=230679';
  var RS='https://suny-fre.primo.exlibrisgroup.com/discovery/search?vid=01SUNY_FRE:01SUNY_FRE&tab=Everything&search_scope=MyInst_and_CI&query=any,contains,';
  var HOME='Reed’s collection',SRCH='ReedSearch';
  if(CAMPUS){HOME=CAMPUS.name+'’s collection';SRCH=CAMPUS.searchLabel||'the catalog';RS=CAMPUS.host+'/discovery/search?vid='+CAMPUS.vid+'&tab=Everything&search_scope=MyInst_and_CI&query=any,contains,';
    DATA.forEach(function(d){d.cited=d.reed;d.reed=CAMPUS.items[d.title]||[];});}
  var RSUB=RS.replace('any,contains,','sub,exact,');
  function yl(y){return +y<0?(-y)+' BCE':String(y);}
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1)),t=a[i];a[i]=a[j];a[j]=t;}return a;}
  var HLMODE='one';try{HLMODE=localStorage.getItem('ail-tl-hl')||'one';}catch(e){}root.setAttribute('data-hl',HLMODE);
  if(TOPIC.title){var kk=root.querySelector('.ail-tl-kicker');if(kk)kk.textContent=TOPIC.title;}
  var SUGGEST='';/* link to the suggestion form; the line stays hidden while this is empty */
  (function(){var sg=root.parentNode.querySelector('.ail-tl-suggest');if(sg&&SUGGEST){sg.querySelector('a').href=SUGGEST;sg.hidden=false;}})();
  var KINDS={book:'Book',ebook:'E-book',video:'Video',nyt:'NYT',article:'Article',essay:'Essay',film:'Film analysis',chapter:'Chapter',review:'Review',reference:'Reference',news:'News',dissertation:'Dissertation'};
  /* typefaces and button styles that felt high-tech in each era, and the hardware drawn behind them */
  var ERAS=[{to:1899,id:'engraved',b:'gears',f:'"IM Fell English",Georgia,serif',c:'#e8d9a8',l:'Engraved type, before 1900'},
    {to:1939,id:'deco',b:'tubes',f:'Limelight,Georgia,serif',c:'#f2d37a',l:'Art Deco, 1920s and 1930s'},
    {to:1959,id:'teletype',b:'tubes',f:'"Special Elite","Courier New",monospace',c:'#efe8d6',l:'Typewriter and teletype, 1940s and 1950s'},
    {to:1979,id:'space',b:'dip',f:'Michroma,Arial,sans-serif',c:'#ff8a3d',l:'Space age, 1960s and 1970s'},
    {to:1994,id:'terminal',b:'green',f:'VT323,monospace',c:'#33ff66',l:'Green-screen terminal, 1980s'},
    {to:2009,id:'y2k',b:'blue',f:'Orbitron,Arial,sans-serif',c:'#9cc8ff',l:'Y2K future, late 1990s and 2000s'},
    {to:2019,id:'modern',b:'die',f:'"Space Grotesk",Arial,sans-serif',c:'#f3f1ea',l:'Clean modern sans, 2010s'},
    {to:9999,id:'now',b:'die',f:'"JetBrains Mono",monospace',c:'#c4d600',l:'Code font, 2020s'}];if(TOPIC.eras)ERAS=TOPIC.eras;
  var BOARDS={gears:{bg:'#1a1209',line:'rgba(205,165,90,.20)',pad:'rgba(205,165,90,.30)',pk:'255,214,140',glow:'#e8c27a'},
    tubes:{bg:'#120c08',line:'rgba(184,115,51,.26)',pad:'rgba(255,140,60,.30)',pk:'255,160,80',glow:'#ffb36b'},
    dip:{bg:'#241a0c',line:'rgba(214,170,80,.24)',pad:'rgba(230,190,110,.34)',pk:'255,200,110',glow:'#ffc46b'},
    green:{bg:'#06210f',line:'rgba(110,200,120,.22)',pad:'rgba(220,200,120,.32)',pk:'90,255,130',glow:'#5cff8a'},
    blue:{bg:'#051226',line:'rgba(110,160,230,.22)',pad:'rgba(200,210,230,.30)',pk:'150,200,255',glow:'#9cc8ff'},
    die:{bg:'#05070d',line:'rgba(150,170,200,.16)',pad:'rgba(196,214,0,.30)',pk:'215,242,90',glow:'#d7f25a'}};
  var PHOTOS={"gears": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/A_Jacquard_loom_showing_information_punchcards%2C_National_Museum_of_Scotland.jpg/1920px-A_Jacquard_loom_showing_information_punchcards%2C_National_Museum_of_Scotland.jpg", "page": "https://commons.wikimedia.org/wiki/File:A_Jacquard_loom_showing_information_punchcards,_National_Museum_of_Scotland.jpg", "credit": "Jacquard loom punch cards (Stephencdickson, CC BY-SA 4.0)"}, "tubes": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/ENIAC_Tubes_%282585374699%29.jpg/1920px-ENIAC_Tubes_%282585374699%29.jpg", "page": "https://commons.wikimedia.org/wiki/File:ENIAC_Tubes_(2585374699).jpg", "credit": "ENIAC vacuum tubes (Erik Pitti, CC BY 2.0)"}, "dip": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Fairchild_7447A_die_mit5x.jpg/1920px-Fairchild_7447A_die_mit5x.jpg", "page": "https://commons.wikimedia.org/wiki/File:Fairchild_7447A_die_mit5x.jpg", "credit": "Fairchild 7447A chip die (John McMaster, CC BY 4.0)"}, "green": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/IBM_PC_Motherboard_%281981%29.jpg/1920px-IBM_PC_Motherboard_%281981%29.jpg", "page": "https://commons.wikimedia.org/wiki/File:IBM_PC_Motherboard_(1981).jpg", "credit": "IBM PC motherboard, 1981 (German, CC BY-SA 3.0)"}, "blue": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Intel_Dixon_%28Pentium_II%29_die_shot.jpg/1920px-Intel_Dixon_%28Pentium_II%29_die_shot.jpg", "page": "https://commons.wikimedia.org/wiki/File:Intel_Dixon_(Pentium_II)_die_shot.jpg", "credit": "Intel Pentium II die (Martijn Boer, Public domain)"}, "die": {"src": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Zen2_Matisse_Ryzen_7nm_Core_Die_shot.jpg/1920px-Zen2_Matisse_Ryzen_7nm_Core_Die_shot.jpg", "page": "https://commons.wikimedia.org/wiki/File:Zen2_Matisse_Ryzen_7nm_Core_Die_shot.jpg", "credit": "AMD Zen 2 processor die (Fritzchens Fritz, CC0)"}};if(TOPIC.photos)PHOTOS=TOPIC.photos;if(TOPIC.boards)for(var bk in TOPIC.boards)BOARDS[bk]=TOPIC.boards[bk];
  function eraOf(y){for(var i=0;i<ERAS.length;i++)if(y<=ERAS[i].to)return ERAS[i];return ERAS[ERAS.length-1];}
  function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e;}
  function fmtDate(d){if(+d.year<0)return yl(d.year);var p=String(d.date||d.year).split('-');var M=['January','February','March','April','May','June','July','August','September','October','November','December'];if(p.length===3)return M[+p[1]-1]+' '+(+p[2])+', '+p[0];if(p.length===2)return M[+p[1]-1]+' '+p[0];return p[0];}
  function months(d){if(+d.year<0)return (+d.year)*12;var p=String(d.date||d.year).split('-');return (+p[0])*12+((p[1]?+p[1]:6)-1);}
  function gapText(a,b){var m=months(b)-months(a);if(m>=24)return '+'+Math.round(m/12)+' years';if(m>=12)return '+1 year';if(m<=0)return 'same time';return '+'+m+(m===1?' month':' months');}
  DATA.forEach(function(d){d.track=d.track||d.kind||'tech';if(!TRACKS[d.track])d.track='tech';});
  var on={};Object.keys(TRACKS).forEach(function(t){on[t]=true;});
  var seq=[],maxGap=1;
  function build(){seq=DATA.map(function(_,i){return i;}).filter(function(i){return on[DATA[i].track];});maxGap=1;for(var k=1;k<seq.length;k++)maxGap=Math.max(maxGap,months(DATA[seq[k]])-months(DATA[seq[k-1]]));}
  /* cards */
  var MORE=[];
  var cards=DATA.map(function(d,i){
    var a=el('article','ail-tl-card'+(d.open?' is-open':''));a.setAttribute('aria-hidden','true');a.setAttribute('data-track',d.track);
    var fig=el('div','ail-tl-img');
    if(d.image&&d.image.src){var im=new Image();im.src=d.image.src;im.alt=d.image.alt||'';im.loading='lazy';im.decoding='async';fig.appendChild(im);}
    else{var n=el('div','ail-tl-noimg',yl(d.year));n.style.setProperty('--yf',eraOf(d.year).f);n.setAttribute('aria-hidden','true');fig.appendChild(n);}
    a.appendChild(fig);
    var b=el('div','ail-tl-body');b.appendChild(el('p','ail-tl-tag',TRACKS[d.track]));if(d.isNew)b.appendChild(el('p','ail-tl-new','Recently added'));b.appendChild(el('p','ail-tl-date',fmtDate(d)));b.appendChild(el('h3','ail-tl-title',d.title));
    b.appendChild(el('p','ail-tl-text',d.text));
    /* headlines from several outlets: shuffled on every visit; "one" shows the first, "stack" shows all; the pop-up always lists all */
    if(d.headlines&&d.headlines.length>1){var hs=shuffle(d.headlines),hw=el('div','ail-tl-hl');var hk=el('p','ail-tl-hl-k');hk.appendChild(el('span','k-one','Headline (one of '+hs.length+', picked at random each visit)'));hk.appendChild(el('span','k-all','How '+hs.length+' outlets headlined it (random order)'));hw.appendChild(hk);
      hs.forEach(function(h,j){var hp=el('p','ail-tl-hl-i'+(j?'':' is-pick'));var ha=el('a',null,'“'+h.headline+'”');ha.href=h.url;hp.appendChild(ha);hp.appendChild(document.createTextNode(' '+h.outlet+(h.date?', '+h.date:'')));hw.appendChild(hp);});b.appendChild(hw);var hw2=hw.cloneNode(true);hw2.className='ail-tl-hl ail-tl-hl-all';var vk=document.createElement('p');vk.className='ail-tl-hl-k';vk.textContent='Compare headlines';hw2.replaceChild(vk,hw2.firstChild);b._hl=hw2;}
    if(d.why){var w=el('p','ail-tl-why');w.appendChild(el('strong',null,'Why it mattered: '));w.appendChild(document.createTextNode(d.why));b.appendChild(w);}
    var meta=el('p','ail-tl-meta');
    if(d.source&&d.source.url){meta.appendChild(document.createTextNode('Source: '));var s=el('a',null,d.source.label||'source');s.href=d.source.url;meta.appendChild(s);}
    if(d.image&&d.image.credit){meta.appendChild(document.createTextNode((meta.childNodes.length?'. ':'')+'Image: '));if(d.image.page){var c=el('a',null,d.image.credit);c.href=d.image.page;meta.appendChild(c);}else meta.appendChild(document.createTextNode(d.image.credit));}
    var more=el('div','ail-tl-more');if(b._hl)more.appendChild(b._hl);
    (d.quotes||[]).forEach(function(q){var bq=el('blockquote','ail-tl-q');bq.appendChild(document.createTextNode('“'+q.q+'”'));var ci=el('cite');ci.appendChild(document.createTextNode(q.who+(q.src?', ':'')));if(q.src){var qa=el('a',null,q.src.label);qa.href=q.src.url;ci.appendChild(qa);}bq.appendChild(ci);more.appendChild(bq);});
    if(d.reading){var rd=el('p','ail-tl-read');rd.appendChild(el('strong',null,'How people read it: '));rd.appendChild(document.createTextNode(d.reading+' '));if(d.reading_src&&d.reading_src.url){var rsa=el('a',null,'('+(d.reading_src.label||'source')+')');rsa.href=d.reading_src.url;rd.appendChild(rsa);}more.appendChild(rd);}
    if(d.musing_sources&&d.musing_sources.length){var ms2=el('div','ail-tl-reed');ms2.appendChild(el('strong',null,'Sources behind Christina’s note'));var ul2=el('ul');d.musing_sources.forEach(function(x){var li=el('li');var a2=el('a',null,x.label);a2.href=x.url;li.appendChild(a2);if(x.note)li.appendChild(document.createTextNode(' ('+x.note+')'));ul2.appendChild(li);});ms2.appendChild(ul2);more.appendChild(ms2);}
    if((d.read_free||d.audio)&&!d.listen)d.listen={};
    if(d.listen){var ls=el('div','ail-tl-listen');if(d.read_free){var rf=el('a','ail-tl-lbtn','Read it free');rf.href=d.read_free.url;rf.title=d.read_free.label||'';ls.appendChild(rf);}if(d.audio&&d.audio.url){var au=el('a','ail-tl-lbtn','Listen to the audiobook');au.href=d.audio.url;au.title=d.audio.label||'';ls.appendChild(au);}
      if(d.listen.youtube){var pb=el('button',null,'▶ Play the song');pb.type='button';pb.setAttribute('aria-label','Play '+(d.listen.label||d.title)+' (YouTube video)');pb.addEventListener('click',function(e){e.stopPropagation();if(fig.querySelector('iframe'))return;var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+d.listen.youtube+'?autoplay=1&rel=0';f.title=(d.listen.label||d.title)+' (YouTube video)';f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;fig.appendChild(f);});ls.appendChild(pb);}
      if(d.listen.spotify){var sp=el('a','ail-tl-lbtn','Open in Spotify');sp.href=d.listen.spotify;ls.appendChild(sp);}
      if(d.listen.qr){var qi=new Image();qi.className='ail-tl-qr';qi.src=d.listen.qr;qi.alt='QR code: listen to '+(d.listen.label||d.title)+' on your phone';ls.appendChild(qi);}
      b.appendChild(ls);}
    if((d.search&&d.search.length)||(d.lc&&d.lc.length)){var sx2=el('div','ail-tl-search');sx2.appendChild(el('span','ail-tl-search-l','Explore in '+SRCH+':'));(d.search||[]).forEach(function(t){var sa=el('a',null,t.term);sa.href=RS+encodeURIComponent(t.term);sa.title='Search '+SRCH+' for '+t.term;sx2.appendChild(sa);});
      (d.lc||[]).forEach(function(h){var la=el('a','ail-tl-lc','Subject: '+(h.label||h.heading));la.href=RSUB+encodeURIComponent(h.heading);la.title='Library of Congress heading: '+h.heading;sx2.appendChild(la);});more.appendChild(sx2);}
    if(d.musing){var mu=el('p','ail-tl-musing');var ml=el('a','ail-tl-musing-by','Librarian’s note · Christina');ml.href=PROFILE;mu.appendChild(ml);mu.appendChild(document.createTextNode(' '));mu.appendChild(document.createTextNode(d.musing));b.appendChild(mu);}
    more.appendChild(meta);
    if(d.reed&&d.reed.length){var rb=el('div','ail-tl-reed');rb.appendChild(el('strong',null,'In '+HOME));var ul=el('ul');d.reed.forEach(function(x){var li=el('li');li.appendChild(el('span','ail-tl-kind',KINDS[x.kind]||'Item'));var t=x.title.split(' : ')[0].split(': ')[0];if(t.length>70)t=t.slice(0,67)+'...';var ra=el('a',null,t);ra.href=x.url;ra.title=x.title+(x.by?', '+x.by:'')+(x.note?' ('+x.note+')':'');li.appendChild(ra);ul.appendChild(li);});rb.appendChild(ul);more.appendChild(rb);}
    if(CAMPUS&&d.cited&&d.cited.length){var cw=el('div','ail-tl-reed');cw.appendChild(el('strong',null,'Works this card cites (Reed Library, SUNY Fredonia)'));var cu=el('ul');d.cited.forEach(function(x){var li=el('li');li.appendChild(el('span','ail-tl-kind',KINDS[x.kind]||'Item'));var t=x.title.split(' : ')[0].split(': ')[0];li.appendChild(document.createTextNode(t+' '));var fa=el('a',null,'(find it in '+SRCH+')');fa.href=RS+encodeURIComponent(t);li.appendChild(fa);cu.appendChild(li);});cw.appendChild(cu);more.appendChild(cw);}
    if(d.contributor||d.reviewer){var cr=el('p','ail-tl-meta');if(d.contributor)cr.appendChild(document.createTextNode('Contributed by '+d.contributor+'. '));if(d.reviewer)cr.appendChild(document.createTextNode('Reviewed by '+d.reviewer+'.'));more.appendChild(cr);}
    MORE[i]=more;var ob=el('button','ail-tl-open','Sources and links');ob.type='button';ob.setAttribute('aria-haspopup','dialog');ob.addEventListener('click',function(e){e.stopPropagation();openMore(i,ob);});b.appendChild(ob);
    a.appendChild(b);
    a.addEventListener('click',function(e){var s=a.getAttribute('data-slot');if(s&&s!=='0'&&s!=='hidden'&&!(e.target.closest&&e.target.closest('a')))go(seq.indexOf(i));});
    cardsEl.appendChild(a);return a;
  });
  /* "Sources and links" pop-up */
  var dlg=root.parentNode.querySelector('.ail-tl-dlg'),dlgB=dlg.querySelector('.ail-tl-dlg-b'),dlgH=dlg.querySelector('h2'),dlgK=dlg.querySelector('.ail-tl-dlg-k'),dlgFrom=null;
  function openMore(i,from){var d=DATA[i];dlgFrom=from;dlg.setAttribute('data-track',d.track);dlgK.textContent=TRACKS[d.track]+' · '+fmtDate(d);dlgH.textContent=d.title;dlgB.innerHTML='';dlgB.appendChild(MORE[i].cloneNode(true));
    if(dlg.showModal)dlg.showModal();else dlg.setAttribute('open','');dlg.querySelector('.ail-tl-dlg-x').focus();}
  function closeMore(){if(dlg.close)dlg.close();else dlg.removeAttribute('open');}
  dlg.querySelector('.ail-tl-dlg-x').addEventListener('click',closeMore);
  dlg.addEventListener('click',function(e){if(e.target===dlg)closeMore();});
  dlg.addEventListener('close',function(){if(dlgFrom)dlgFrom.focus();});
  /* plain list (text alternative) */
  var ol=root.parentNode.querySelector('.ail-tl-list ol');
  DATA.forEach(function(d){var li=el('li');li.appendChild(el('strong',null,fmtDate(d)+' ('+TRACKS[d.track]+'): '+d.title+'. '));li.appendChild(document.createTextNode(d.text+(d.why?' '+d.why:'')+(d.reading?' How people read it: '+d.reading:'')+(d.musing?' Librarian’s note (Christina Hilburger): '+d.musing:'')+' '));
    if(d.source&&d.source.url){var s=el('span','ail-tl-src');s.appendChild(document.createTextNode('Source: '));var a=el('a',null,d.source.label||'source');a.href=d.source.url;s.appendChild(a);li.appendChild(s);}
    if(d.reed&&d.reed.length){var rs=el('span','ail-tl-src');rs.appendChild(document.createTextNode(' In '+HOME+': '));d.reed.forEach(function(x,j){if(j)rs.appendChild(document.createTextNode('; '));var ra=el('a',null,x.title);ra.href=x.url;rs.appendChild(ra);});li.appendChild(rs);}
    if(d.listen){var lsn=el('span','ail-tl-src');lsn.appendChild(document.createTextNode(' Listen: '));if(d.listen.youtube){var ya=el('a',null,'YouTube');ya.href='https://www.youtube.com/watch?v='+d.listen.youtube;lsn.appendChild(ya);}if(d.listen.spotify){if(d.listen.youtube)lsn.appendChild(document.createTextNode(', '));var sa=el('a',null,'Spotify');sa.href=d.listen.spotify;lsn.appendChild(sa);}li.appendChild(lsn);}
    ol.appendChild(li);});
  /* circuit path through points: horizontal runs, 45-degree bends, vertical jogs */
  function circuit(P){var d='M '+P[0].x+' '+P[0].y;for(var j=1;j<P.length;j++){var a=P[j-1],b=P[j],dy=b.y-a.y,mx=(a.x+b.x)/2,c=Math.min(Math.abs(dy)/2,24)*(dy<0?-1:1),c2=Math.abs(c);
      d+=' L '+(mx-c2)+' '+a.y+' L '+mx+' '+(a.y+c)+' L '+mx+' '+(b.y-c)+' L '+(mx+c2)+' '+b.y+' L '+b.x+' '+b.y;}return d;}
  var cur=0,lastPts=null;
  function layout(){
    var W=cardsEl.clientWidth;var big=cards[0].offsetWidth||360;var bigH=(cards[seq[cur]]||cards[0]).offsetHeight||380;
    cardsEl.parentNode.style.height=(bigH+12)+'px';
    var cxm=(W-big)/2,mid=Math.min(bigH*.34,140),S=[1,.46,.32,.24];
    function pos(r){if(r===0)return{x:cxm,y:0,s:1};var a=Math.abs(r),sc=S[Math.min(a,3)],w=big*sc,gap=24,off=big/2+gap;for(var k=1;k<a;k++)off+=big*S[Math.min(k,3)]+gap*.7;off+=w/2;return{x:W/2+(r>0?off:-off)-w/2,y:mid-(cards[0].offsetHeight*sc)*.34+a*14,s:sc,w:w};}
    var pts=[];
    cards.forEach(function(c,i){
      var q=seq.indexOf(i),r=q<0?99:q-cur,slot,p;
      if(q<0){c.setAttribute('data-slot','hidden');c.setAttribute('aria-hidden','true');c.style.transform='translate('+(W/2-big/2)+'px,'+(bigH*.3)+'px) scale(.2)';return;}
      if(Math.abs(r)<=3){p=pos(r);slot=String(r);var w=big*p.s,vis=p.x+w>-w*.6&&p.x<W+w*.6;if(!vis)slot='hidden';c.style.transform='translate('+p.x+'px,'+p.y+'px) scale('+p.s+')';if(vis)pts.push({r:r,x:p.x+w/2,y:Math.round(p.y+(c.offsetHeight*p.s)*.34)});}
      else{slot='hidden';p=pos(r>0?3:-3);c.style.transform='translate('+(r>0?W+60:-big)+'px,'+p.y+'px) scale(.2)';}
      c.setAttribute('data-slot',slot);c.setAttribute('aria-hidden',r===0?'false':'true');
    });
    pts.sort(function(a,b){return a.r-b.r;});
    if(!pts.length)return;
    var P=[{x:-40,y:pts[0].y}].concat(pts.map(function(q){return{x:q.x,y:q.y,r:q.r};}));P.push({x:W+40,y:P[P.length-1].y});
    trace.setAttribute('d',circuit(P));
    var upto=[];for(var j=0;j<P.length;j++){upto.push(P[j]);if(P[j].r===0)break;}
    lit.setAttribute('d',circuit(upto));lastPts=P;
  }
  /* a pulse of light runs along the circuit from the previous card into the current one */
  function runPulse(fwd){if(reduce||!lastPts)return;var i0=-1;for(var j=0;j<lastPts.length;j++)if(lastPts[j].r===0)i0=j;if(i0<1)return;
    var seg=fwd?[lastPts[i0-1],lastPts[i0]]:[lastPts[i0+1]||lastPts[i0],lastPts[i0]];pulse.setAttribute('d',circuit(seg));
    var L=pulse.getTotalLength();pulse.style.transition='none';pulse.style.strokeDasharray='40 '+L;pulse.style.strokeDashoffset='40';pulse.style.opacity='1';
    pulse.getBoundingClientRect();pulse.style.transition='stroke-dashoffset .75s cubic-bezier(.4,0,.2,1),opacity .3s ease .7s';pulse.style.strokeDashoffset=String(-L);pulse.style.opacity='0';}
  /* era-accurate boards (real photos, tinted; drawn boards as a fallback). Boards blend over about three cards around each era change. */
  var skyA=root.querySelector('.ail-tl-sky--a'),skyB=root.querySelector('.ail-tl-sky--b'),front=skyA,dpr=window.devicePixelRatio||1,cache={},speed=.3,target=.3,raf=null,visible=true,primary='',want={},have={};
  skyB.style.display='none';
  function rnd(a,b){return a+Math.random()*(b-a);}
  function makeBoard(id){var r=root.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr)),key=id+w+'x'+h;if(cache[key])return cache[key];
    var B=BOARDS[id],off=document.createElement('canvas');off.width=w;off.height=h;var o=off.getContext('2d');o.lineCap='round';o.lineJoin='round';var traces=[],g=26*dpr,i,k;
    function path(pts,lw){o.lineWidth=lw;o.strokeStyle=B.line;o.beginPath();o.moveTo(pts[0][0],pts[0][1]);for(var m=1;m<pts.length;m++)o.lineTo(pts[m][0],pts[m][1]);o.stroke();traces.push(pts);}
    function pad(x,y,rr){o.fillStyle=B.pad;o.beginPath();o.arc(x,y,rr,0,6.283);o.fill();o.fillStyle=B.bg;o.beginPath();o.arc(x,y,rr*.4,0,6.283);o.fill();}
    function chip(x,y,cw,ch,pins,sides){o.fillStyle='rgba(10,10,10,.85)';o.strokeStyle=B.line;o.lineWidth=1*dpr;o.fillRect(x,y,cw,ch);o.strokeRect(x,y,cw,ch);o.fillStyle=B.pad;
      for(var p=0;p<pins;p++){var t=(p+.5)/pins;o.fillRect(x+t*cw-1.5*dpr,y-5*dpr,3*dpr,5*dpr);o.fillRect(x+t*cw-1.5*dpr,y+ch,3*dpr,5*dpr);if(sides){o.fillRect(x-5*dpr,y+t*ch-1.5*dpr,5*dpr,3*dpr);o.fillRect(x+cw,y+t*ch-1.5*dpr,5*dpr,3*dpr);}}}
    function walk(step,len,diag){var x=Math.floor(rnd(0,w)/step)*step,y=Math.floor(rnd(0,h)/step)*step,dirs=diag?[[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1]]:[[1,0],[0,1],[-1,0],[0,-1]],d=Math.floor(rnd(0,dirs.length)),pts=[[x,y]];
      for(var s=0;s<len;s++){if(Math.random()<.25)d=(d+(Math.random()<.5?1:dirs.length-1))%dirs.length;x+=dirs[d][0]*step;y+=dirs[d][1]*step;pts.push([x,y]);}return pts;}
    var n=Math.round(w*h/(g*g*9));
    if(id==='gears'){for(i=0;i<Math.round(n/3);i++){var cxg=rnd(0,w),cyg=rnd(0,h),R=rnd(18,60)*dpr,teeth=Math.round(R/(5*dpr));o.strokeStyle=B.line;o.lineWidth=2*dpr;o.beginPath();
        for(k=0;k<=teeth*2;k++){var ang=k/(teeth*2)*6.283,rr=k%2?R:R*.86;o.lineTo(cxg+Math.cos(ang)*rr,cyg+Math.sin(ang)*rr);}o.stroke();pad(cxg,cyg,R*.18);
        var ring=[];for(k=0;k<=24;k++){var a2=k/24*6.283;ring.push([cxg+Math.cos(a2)*R*.6,cyg+Math.sin(a2)*R*.6]);}traces.push(ring);}
      for(i=0;i<Math.round(h/(70*dpr));i++){var yy=rnd(0,h);o.fillStyle=B.pad;for(k=0;k<w;k+=14*dpr)if(Math.random()<.35)o.fillRect(k,yy,6*dpr,9*dpr);}}
    else if(id==='tubes'){for(i=0;i<Math.round(n/2);i++){var x0=rnd(0,w),y0=rnd(0,h),x1=x0+rnd(-200,200)*dpr,y1=y0+rnd(-120,120)*dpr,pts=[];for(k=0;k<=16;k++){var t=k/16;pts.push([x0+(x1-x0)*t+Math.sin(t*3.14)*30*dpr,y0+(y1-y0)*t]);}path(pts,2*dpr);}
      for(i=0;i<Math.round(n/8);i++){var tx=rnd(0,w),ty=rnd(0,h);o.strokeStyle=B.pad;o.lineWidth=2*dpr;o.beginPath();o.arc(tx,ty,14*dpr,3.14,0);o.lineTo(tx+14*dpr,ty+36*dpr);o.lineTo(tx-14*dpr,ty+36*dpr);o.closePath();o.stroke();
        var gr=o.createRadialGradient(tx,ty+14*dpr,1,tx,ty+14*dpr,16*dpr);gr.addColorStop(0,'rgba(255,140,50,.35)');gr.addColorStop(1,'rgba(255,140,50,0)');o.fillStyle=gr;o.fillRect(tx-20*dpr,ty-10*dpr,40*dpr,50*dpr);}}
    else if(id==='dip'){for(i=0;i<n;i++){var t1=walk(g,Math.round(rnd(3,10)),false);path(t1,3*dpr);pad(t1[0][0],t1[0][1],4*dpr);pad(t1[t1.length-1][0],t1[t1.length-1][1],4*dpr);}
      for(i=0;i<Math.round(n/10);i++)chip(rnd(0,w),rnd(0,h),rnd(60,110)*dpr,24*dpr,Math.round(rnd(6,10)),false);}
    else if(id==='green'){for(i=0;i<Math.round(n*1.4);i++){var t2=walk(g*.8,Math.round(rnd(4,12)),true);path(t2,2*dpr);pad(t2[0][0],t2[0][1],3.2*dpr);pad(t2[t2.length-1][0],t2[t2.length-1][1],3.2*dpr);}
      for(i=0;i<Math.round(n/8);i++)chip(rnd(0,w),rnd(0,h),rnd(70,120)*dpr,22*dpr,Math.round(rnd(7,12)),false);}
    else if(id==='blue'){for(i=0;i<Math.round(n*2);i++){var t3=walk(g*.6,Math.round(rnd(5,14)),true);path(t3,1.4*dpr);pad(t3[t3.length-1][0],t3[t3.length-1][1],2.4*dpr);}
      for(i=0;i<Math.round(n/10);i++){var cs=rnd(40,70)*dpr;chip(rnd(0,w),rnd(0,h),cs,cs,Math.round(cs/(7*dpr)),true);}}
    else{for(i=0;i<Math.round(n*2.6);i++){var t4=walk(g*.45,Math.round(rnd(6,18)),true);path(t4,1*dpr);}
      for(i=0;i<3;i++){var dx=rnd(0,w),dy=rnd(0,h),ds=rnd(90,140)*dpr;o.fillStyle='rgba(20,24,34,.9)';o.fillRect(dx,dy,ds,ds);o.strokeStyle=B.pad;o.lineWidth=1*dpr;o.strokeRect(dx,dy,ds,ds);
        for(var gx=0;gx<6;gx++)for(var gy=0;gy<6;gy++){o.fillStyle='rgba(196,214,0,'+rnd(.05,.25)+')';o.fillRect(dx+8*dpr+gx*(ds-16*dpr)/6,dy+8*dpr+gy*(ds-16*dpr)/6,(ds-16*dpr)/6-3*dpr,(ds-16*dpr)/6-3*dpr);}}}
    var res={img:off,traces:traces,B:B};cache[key]=res;return res;}
  var photoImgs={},bgc=root.querySelector('.ail-tl-bgcredit');
  function photoBoard(id){var ph=PHOTOS[id];if(!ph)return null;var im=photoImgs[id];
    if(!im){im=new Image();im.decoding='async';im.onload=function(){if(primary)mix(want,primary);};im.src=ph.src;photoImgs[id]=im;}
    if(!im.complete||!im.naturalWidth)return null;
    var r=root.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*dpr)),h=Math.round(w*1.5),key='ph'+id+w;if(cache[key])return cache[key];
    var W2=Math.round(w*1.12),H2=Math.round(h*1.12),off=document.createElement('canvas');off.width=W2;off.height=H2;var o=off.getContext('2d');
    var sc=Math.max(W2/im.naturalWidth,H2/im.naturalHeight);o.drawImage(im,(W2-im.naturalWidth*sc)/2,(H2-im.naturalHeight*sc)/2,im.naturalWidth*sc,im.naturalHeight*sc);
    var B=BOARDS[id];o.globalCompositeOperation='color';o.fillStyle=B.glow;o.fillRect(0,0,W2,H2);
    o.globalCompositeOperation='multiply';o.fillStyle='rgba(30,30,30,1)';o.globalAlpha=.62;o.fillRect(0,0,W2,H2);o.globalAlpha=1;o.globalCompositeOperation='source-over';
    var g=o.createRadialGradient(W2/2,H2*.45,Math.min(W2,H2)*.2,W2/2,H2*.45,Math.max(W2,H2)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,B.bg);o.fillStyle=g;o.fillRect(0,0,W2,H2);
    var res={img:off,traces:[],B:B,photo:true,w:w,h:h};cache[key]=res;return res;}
  function boardFor(id){return photoBoard(id)||makeBoard(id);}
  function mix(map,prim){want=map;if(prim!==primary){primary=prim;var B=BOARDS[prim];root.style.setProperty('--bg',B.bg);root.style.setProperty('--glow',B.glow);}
    var ph=PHOTOS[prim],pb=photoBoard(prim);if(ph&&pb){bgc.textContent='Background: '+ph.credit;bgc.href=ph.page;bgc.hidden=false;}else bgc.hidden=true;
    Object.keys(map).forEach(function(id){if(have[id]==null)have[id]=0;});if(reduce){have=JSON.parse(JSON.stringify(map));draw();}}
  var pan=0,sparks=[];for(var si=0;si<46;si++)sparks.push({x:Math.random(),y:Math.random(),l:.3+Math.random()});
  function paint(c,bd,alpha){if(!bd||alpha<=.01)return;c.globalAlpha=alpha;
    if(bd.photo){var mx=bd.img.width-front.width,t=pan%2,f=t<1?t:2-t;c.drawImage(bd.img,-mx*f,-bd.img.height*.04);}else c.drawImage(bd.img,0,0);c.globalAlpha=1;}
  function draw(){var r=root.getBoundingClientRect(),w=Math.max(1,Math.round(r.width*dpr)),h=Math.max(1,Math.round(r.height*dpr));if(front.width!==w||front.height!==h){front.width=w;front.height=h;}
    var c=front.getContext('2d');c.fillStyle=getComputedStyle(root).getPropertyValue('--bg')||'#04130f';c.fillRect(0,0,w,h);speed+=(target-speed)*.04;if(!reduce)pan+=.00005;
    Object.keys(have).forEach(function(id){var t=want[id]||0;have[id]+=(t-have[id])*(reduce?1:.05);if(have[id]<.005&&!t)delete have[id];});
    var ids=Object.keys(have).sort(function(x,y){return x===primary?-1:y===primary?1:have[y]-have[x];});
    ids.forEach(function(id,i){paint(c,boardFor(id),i===0?Math.min(1,have[id]):have[id]);});
    var B=BOARDS[primary]||BOARDS.die;
    for(var k=0;k<sparks.length;k++){var sp=sparks[k];if(!reduce){sp.x+=.0009*speed*sp.l;if(sp.x>1.05){sp.x=-.05;sp.y=Math.random();}}var X=sp.x*w,Y=sp.y*h,len=(6+speed*5)*sp.l*dpr;
      var gr=c.createLinearGradient(X-len,Y,X,Y);gr.addColorStop(0,'rgba('+B.pk+',0)');gr.addColorStop(1,'rgba('+B.pk+','+Math.min(1,.35+speed/12)+')');c.strokeStyle=gr;c.lineWidth=1.6*dpr;c.beginPath();c.moveTo(X-len,Y);c.lineTo(X,Y);c.stroke();}
    if(!reduce&&visible)raf=requestAnimationFrame(draw);}
  /* big year: count up, fill, and switch typeface, buttons and board by era */
  var yearAnim=null;
  function showYear(from,to){var e=eraOf(to);root.setAttribute('data-era',e.id);root.style.setProperty('--yf',e.f);root.style.setProperty('--yc',e.c);eraL.textContent='Type style: '+e.l;
    root.classList.remove('is-filled');
    if(reduce||from===to){yOut.textContent=yFill.textContent=yl(to);requestAnimationFrame(function(){root.classList.add('is-filled');});return;}
    cancelAnimationFrame(yearAnim);var t0=performance.now(),dur=Math.min(1100,350+Math.abs(to-from)*3);
    (function step(t){var k=Math.min(1,(t-t0)/dur);k=1-Math.pow(1-k,3);var y=Math.round(from+(to-from)*k);yOut.textContent=yFill.textContent=yl(y);if(k<1)yearAnim=requestAnimationFrame(step);else root.classList.add('is-filled');})(t0);}
  /* blend: the next era's board fades in over the two cards before it; the last era's board lingers one card after */
  function bOf(i){var x=DATA[seq[i]];return x?eraOf(x.year).b:null;}
  function blend(){var p=bOf(cur),m={};m[p]=1;var n1=bOf(cur+1),n2=bOf(cur+2),b1=bOf(cur-1);
    if(n1&&n1!==p)m[n1]=.45;else if(n2&&n2!==p)m[n2]=.2;if(b1&&b1!==p)m[b1]=Math.max(m[b1]||0,.35);mix(m,p);}
  /* move */
  function go(k,fromFilter){
    if(!seq.length||k<0||k>=seq.length)return;var prevYear=(DATA[seq[cur]]||DATA[seq[k]]).year,fwd=k>cur;cur=k;layout();var d=DATA[seq[cur]];showYear(prevYear,d.year);blend();if(!fromFilter)runPulse(fwd);
    count.textContent=(cur+1)+' / '+seq.length;sr.textContent='Milestone '+(cur+1)+' of '+seq.length+': '+fmtDate(d)+', '+d.title;
    back.disabled=cur===0;
    if(cur<seq.length-1){var nx=DATA[seq[cur+1]];pull.disabled=false;pullT.textContent='Follow the circuit: '+yl(nx.year);pull.setAttribute('aria-label','Next milestone: '+yl(nx.year)+', '+nx.title);
      var g=months(nx)-months(d);gapV.textContent=gapText(d,nx);gapBar.style.width=Math.max(3,Math.round(Math.sqrt(Math.max(g,1)/maxGap)*100))+'%';
      target=reduce?0:Math.min(14,.3+8/Math.sqrt(Math.max(g,1)));}
    else{pull.disabled=true;pullT.textContent='You have reached today';pull.removeAttribute('aria-label');gapV.textContent='';gapBar.style.width='0';target=.5;}}
  /* topic filter: pick one or more topics; All turns every topic back on */
  var filt=root.querySelector('.ail-tl-filter'),allBtn=el('button',null,'All');allBtn.type='button';
  function syncBtns(){var every=Object.keys(on).every(function(t){return on[t];});allBtn.setAttribute('aria-pressed',every?'true':'false');filt.querySelectorAll('button[data-track]').forEach(function(b){b.setAttribute('aria-pressed',on[b.getAttribute('data-track')]?'true':'false');});}
  function refilter(){var y=DATA[seq[cur]]?DATA[seq[cur]].year:DATA[0].year;build();var k=0;for(var j=0;j<seq.length;j++)if(DATA[seq[j]].year<=y)k=j;cur=Math.min(k,Math.max(0,seq.length-1));syncBtns();go(cur,true);}
  allBtn.addEventListener('click',function(){Object.keys(on).forEach(function(t){on[t]=true;});refilter();});filt.appendChild(allBtn);
  if(DATA.some(function(d){return d.headlines&&d.headlines.length>1;})){var hb=el('button','ail-tl-hlbtn');hb.type='button';var setHl=function(m){HLMODE=m;root.setAttribute('data-hl',m);hb.textContent=m==='stack'?'Headlines: all, stacked':'Headlines: one at random';hb.setAttribute('aria-pressed',m==='stack'?'true':'false');try{localStorage.setItem('ail-tl-hl',m);}catch(e){}};
    setHl(HLMODE);hb.addEventListener('click',function(){setHl(HLMODE==='stack'?'one':'stack');layout();});root.querySelector('.ail-tl-controls').appendChild(hb);}
  Object.keys(TRACKS).forEach(function(t){if(!DATA.some(function(d){return d.track===t;}))return;var bt=el('button',null,TRACKS[t]);bt.type='button';bt.setAttribute('data-track',t);
    bt.addEventListener('click',function(){var every=Object.keys(on).every(function(x){return on[x];});if(every){Object.keys(on).forEach(function(x){on[x]=x===t;});}else{on[t]=!on[t];if(!Object.keys(on).some(function(x){return on[x];}))on[t]=true;}refilter();});filt.appendChild(bt);});
  pull.addEventListener('click',function(){go(cur+1);});back.addEventListener('click',function(){go(cur-1);});
  root.addEventListener('keydown',function(e){if(e.target.closest&&e.target.closest('a,button'))return;if(e.key==='ArrowRight'){e.preventDefault();go(cur+1);}else if(e.key==='ArrowLeft'){e.preventDefault();go(cur-1);}});
  var sx=null;root.querySelector('.ail-tl-stage').addEventListener('pointerdown',function(e){sx=e.clientX;});
  window.addEventListener('pointerup',function(e){if(sx!=null&&sx-e.clientX>60)go(cur+1);else if(sx!=null&&e.clientX-sx>60)go(cur-1);sx=null;});
  var rsz=null,lastW=0;function onResize(){clearTimeout(rsz);rsz=setTimeout(function(){var w=Math.round(root.getBoundingClientRect().width);if(w!==lastW){lastW=w;cache={};}layout();if(reduce)draw();},150);}
  if(window.ResizeObserver)new ResizeObserver(onResize).observe(root);else window.addEventListener('resize',onResize);
  if('IntersectionObserver' in window){new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible&&!reduce){cancelAnimationFrame(raf);raf=requestAnimationFrame(draw);}}).observe(root);}
  build();syncBtns();go(0,true);draw();
  window.addEventListener('beforeprint',function(){var d=root.parentNode.querySelector('.ail-tl-list');if(d)d.open=true;});
  }
}
if(window.AIL_TL_DATA){MAIN();return;}fetch(root.getAttribute('data-src')||'https://chilburger.github.io/reed-ai-timeline/dist/timeline-data.json').then(function(r){return r.json();}).then(function(d){if(d&&d.cards){window.AIL_TL_TOPIC=d.topic||{};d=d.cards;}window.AIL_TL_DATA=d;MAIN();}).catch(function(){root.insertAdjacentHTML('afterbegin','<p style="padding:12px">The timeline could not load. The full list of milestones is below.</p>');});})();
