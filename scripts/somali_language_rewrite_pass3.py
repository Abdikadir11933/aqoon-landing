from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
REPL = {
"caawi/ammatillinen-koulutus/index.html": {
    "Vocational education-ka Finland waxaa jira shahaados iyo habab codsi oo kala duwan": "Finland waxaa ka jira noocyo kala duwan oo ammatillinen koulutus ah, shahaadooyin iyo habab codsi oo kala duwan",
    "application-ka": "codsiga",
},
"caawi/linkit/index.html": {
    "material Af-Soomaali ah": "macluumaad Af-Soomaali ah",
    "application-ka": "codsiga",
    "Finnish course ku habboon": "koorso Finnish ah oo ku habboon",
},
"caawi/palveluseteli/index.html": {
    "private early childhood education": "private päiväkoti ama varhaiskasvatus",
    "xaqa voucher": "xaqa palveluseteli",
    "Palveluseteli / palveluseteli": "Palveluseteli",
    "daycare-ka private-ka ah": "private päiväkoti",
    "palveluseteli arrangements": "nidaamka palveluseteli",
    "Details-ku magaalada ayay ku xiran yihiin": "Faahfaahintu magaalada ayay ku xiran tahay",
},
"caawi/tyoton-tyonhakija/index.html": {
    "Employment services-ka Finland waxay isticmaalaan Job Market Finland (Työmarkkinatori) adeegyo badan.": "Adeegyada työllisyyspalvelut ee Finland waxay wax badan ku qabtaan Työmarkkinatori.",
    "Helidda Job Market Finland.": "Helidda Työmarkkinatori.",
},
}
for rel, replacements in REPL.items():
    p = ROOT / rel
    if not p.exists():
        continue
    text = p.read_text(encoding="utf-8")
    old = text
    for a,b in replacements.items():
        text = text.replace(a,b)
    if text != old:
        p.write_text(text, encoding="utf-8")
        print("updated", rel)
