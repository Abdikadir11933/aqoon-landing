from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SO = ROOT / 'so'
DISCLAIMER = '''<aside class="aqoon-legal-note" style="margin:28px 0 0;padding:15px 16px;border:1px solid #e4dfd3;border-radius:16px;background:#fff;color:#55606d;font-size:13px;line-height:1.55"><strong style="color:#0E2440">AQOON waa adeeg madax-bannaan.</strong> Ma nihin Kela, Migri, kunta, työllisyyspalvelut ama hay’ad kale oo rasmi ah, mana gaarno päätös ama dammaanad qaadno tuki, paikka, lupa ama natiijo. Hay’adda ama adeegga mas’uulka ka ah ayaa xaqiijiya shuruudaha iyo go’aanka. <a href="/so/disclaimer" style="color:#08736e;font-weight:700">Faahfaahin</a> · <a href="/so/tietosuoja" style="color:#08736e;font-weight:700">Tietosuoja</a></aside>'''

# Conservative trust-language corrections. Official service names are intentionally preserved.
REPL = {
    'waxa aad xaq u leedahay': 'shuruudaha iyo fursadaha laga yaabo inay xaaladdaada khuseeyaan',
    'waxa aad xaq u leedahay iyo': 'shuruudaha iyo fursadaha laga yaabo inay xaaladdaada khuseeyaan iyo',
    'si toos ah u qalanto': 'si toos ah u buuxinayso shuruudaha',
    'waxaad xaq u leedahay': 'waxaa laga yaabaa inay jiraan waxyaabo xaaladdaada khuseeya',
    'TE-toimisto': 'työllisyyspalvelut',
    'TE-palvelut': 'työllisyyspalvelut',
    'employment services': 'työllisyyspalvelut',
    'service guidance': 'hagidda adeegga',
}

for p in SO.rglob('index.html'):
    rel = p.relative_to(ROOT).as_posix()
    if '/pilke/' in rel or rel.startswith('pilke/') or rel in {'so/disclaimer/index.html','so/tietosuoja/index.html'}:
        continue
    text = p.read_text(encoding='utf-8')
    old = text
    for a,b in REPL.items():
        text = text.replace(a,b)
    if 'aqoon-legal-note' not in text and '</main>' in text:
        text = text.replace('</main>', DISCLAIMER + '</main>', 1)
    if text != old:
        p.write_text(text, encoding='utf-8')

# Intake: remove entitlement-sounding language, add independence/privacy links and optional analytics consent UI.
p = ROOT / 'caawi' / 'index.html'
text = p.read_text(encoding='utf-8')
text = text.replace('Finland joogtaa oo ma hubtid waxa aad xaq u leedahay ama sida loo codsado?', 'Finland joogtaa oo ma hubtid fursadaha kuu jira, shuruudahooda ama sida loo codsado?')
text = text.replace('Faham fursadaha kuu jira, waxa aad xaq u leedahay iyo sida loo codsado.', 'Faham fursadaha kuu jira, shuruudahooda iyo sida loo codsado.')
text = text.replace('Waxaan kaa caawinayaa inaad fahanto fursadaha kuu jira, waxa aad xaq u leedahay, sida loo helo iyo sida loo codsado. Af-Soomaali, bilaash.', 'Waxaan kaa caawinayaa inaad fahanto fursadaha kuu jira, shuruudahooda, meesha saxda ah ee laga hubiyo iyo sida loo codsado. Af-Soomaali, bilaash.')
text = text.replace('<div class="privacy">Lambarkaaga iyo magacaaga waxaa loo isticmaalaa oo keliya in AQOON kula soo xiriiro arrinta aad caawimaadda uga baahan tahay.</div>', '<div class="privacy">Lambarkaaga iyo magacaaga waxaa loo isticmaalaa si aan uga jawaabno codsigaaga oo aan ula soconno caawimaadda aad naga codsatay. Ha ku qorin foomka henkilötunnus ama dokumentiyo xasaasi ah. <a href="/so/tietosuoja">Tietosuoja</a>.</div>')
if 'id="analyticsChoice"' not in text:
    consent = '''<div class="analytics-choice" id="analyticsChoice" hidden role="dialog" aria-live="polite" style="position:fixed;left:12px;right:12px;bottom:12px;z-index:80;max-width:520px;margin:auto;background:#fff;border:1px solid #ddd6c8;border-radius:18px;padding:16px;box-shadow:0 12px 34px rgba(14,36,64,.18)"><strong style="display:block;color:#0E2440;margin-bottom:5px">Analytics-ka ma oggolaanaysaa?</strong><span style="display:block;color:#596471;font-size:14px;line-height:1.45;margin-bottom:12px">Foomku wuu shaqaynayaa xitaa haddii aad diido. Haddii aad oggolaato, waxaan kaydinaynaa xog farsamo si aan u fahanno halka foomku ka adkaado. Magaca iyo telefoonka laguma diro funnel analytics-ka.</span><div style="display:flex;gap:8px"><button type="button" id="analyticsDecline" class="reset" style="flex:1">Maya</button><button type="button" id="analyticsAccept" class="primary teal" style="flex:1;margin:0">Haa</button></div><a href="/so/tietosuoja" style="display:block;text-align:center;margin-top:9px;color:#08736e;font-size:13px;font-weight:700">Akhri tietosuoja</a></div>'''
    text = text.replace('<script src="/caawi/app.js?v=3" defer></script>', consent + '<div style="max-width:520px;margin:18px auto 28px;padding:0 18px;text-align:center;color:#69737f;font:13px/1.5 system-ui"><a href="/so/disclaimer" style="color:#08736e;font-weight:700">AQOON ma aha hay’ad rasmi ah</a> · <a href="/so/tietosuoja" style="color:#08736e;font-weight:700">Tietosuoja</a></div><script src="/caawi/app.js?v=4" defer></script>')
p.write_text(text, encoding='utf-8')

p = ROOT / 'caawi' / 'app.js'
text = p.read_text(encoding='utf-8')
text = text.replace("var HELP='Waxaan kaa caawinayaa inaad fahanto fursadaha kuu jira, waxa aad xaq u leedahay, sida loo codsado, iyo dadka ama barnaamijyada saxda ah ee aan kugu xiriirin karo. Caawimaaddaydu waa bilaash 100%.';", "var HELP='Waxaan kaa caawinayaa inaad fahanto fursadaha kuu jira, shuruudahooda, sida loo codsado iyo meesha rasmiga ah ee xogta laga hubiyo. Haddii loo baahdo, waxaan kuu tilmaamayaa adeegga ama qofka saxda ah. AQOON ma gaarto go’aanka rasmiga ah. Caawimaaddaydu waa bilaash 100%.';")
old_ids = "var visitor=get('aqoon_visitor_id',localStorage)||uuid();set('aqoon_visitor_id',visitor,localStorage);var session=get('aqoon_funnel_session',sessionStorage)||uuid();set('aqoon_funnel_session',session,sessionStorage);var requestId=get('aqoon_intake_request',sessionStorage)||uuid();set('aqoon_intake_request',requestId,sessionStorage);var ids={visitor:visitor,session:session,requestId:requestId};"
new_ids = "var analyticsConsent=get('aqoon_analytics_consent',localStorage);var visitor=analyticsConsent==='yes'?(get('aqoon_visitor_id',localStorage)||uuid()):uuid();if(analyticsConsent==='yes')set('aqoon_visitor_id',visitor,localStorage);var session=uuid();var requestId=get('aqoon_intake_request',sessionStorage)||uuid();set('aqoon_intake_request',requestId,sessionStorage);var ids={visitor:visitor,session:session,requestId:requestId};"
text = text.replace(old_ids,new_ids)
text = text.replace("function track(n,extra){fetch(TRACK", "function track(n,extra){if(analyticsConsent!=='yes')return;fetch(TRACK")
anchor = "var s={screen:'hero',name:'',phone:'',city:'',customCity:'',mainNeed:'',age:'',subNeed:'',requests:[],addingMore:false},screens=[].slice.call(document.querySelectorAll('[data-screen]'));"
if 'analyticsAccept' not in text:
    add = """var analyticsChoice=document.getElementById('analyticsChoice'),analyticsAccept=document.getElementById('analyticsAccept'),analyticsDecline=document.getElementById('analyticsDecline');if(analyticsChoice&&!analyticsConsent)analyticsChoice.hidden=false;if(analyticsAccept)analyticsAccept.onclick=function(){analyticsConsent='yes';set('aqoon_analytics_consent','yes',localStorage);visitor=get('aqoon_visitor_id',localStorage)||visitor||uuid();set('aqoon_visitor_id',visitor,localStorage);ids.visitor=visitor;analyticsChoice.hidden=true;track('analytics_consent')};if(analyticsDecline)analyticsDecline.onclick=function(){analyticsConsent='no';set('aqoon_analytics_consent','no',localStorage);analyticsChoice.hidden=true};
"""
    text = text.replace(anchor, add + anchor)
p.write_text(text, encoding='utf-8')

print('legal trust pass complete')
