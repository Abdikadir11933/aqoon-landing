from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPL = {
"so/ajankohtaiset/index.html": {
    "workshops": "kulan-tababbarro",
    "openings vary": "waqtiga codsigu wuu is beddelaa",
    "Finnish & koulutus": "Finnish & waxbarasho",
    "Shaqo & koulutus": "Shaqo & waxbarasho",
    "Haku 4.9.2026 asti": "Codsigu wuxuu furan yahay ilaa 4.9.2026",
    "Haku 7.9.2026 asti": "Codsigu wuxuu furan yahay ilaa 7.9.2026",
    "Koulutus-ku": "Koulutus-kan",
},
"so/ammatillinen-koulutus/index.html": {
    "barnaamijyo-ka": "barnaamijyada",
    "application period-ka": "waqtiga codsiga",
    "application dates": "taariikhaha codsiga",
    "Studyinfo application": "codsiga Opintopolku / Studyinfo",
    "Finnish-ka job/education vocabulary": "erayada Finnish-ka ee shaqada iyo waxbarashada",
    "continuous application": "jatkuva haku",
    "school-ka": "dugsiga",
    "qualification": "shahaado",
},
"so/dib-ugu-noqo-dugsi/index.html": {
    "Studyinfo application iyo application periods": "codsiga Opintopolku / Studyinfo iyo waqtiyada codsiga",
    "application periods": "waqtiyada codsiga",
    "application": "codsi",
},
"so/esiopetus/index.html": {
    "registration period-ka": "waqtiga isdiiwaangelinta",
    "esiopetus registration-ka": "isdiiwaangelinta esiopetus",
    "paper form": "foom warqad ah",
    "online service-ku": "adeegga online-ka",
    "preparatory teaching ama language support": "valmistava opetus ama taageerada luqadda",
    "annual registration period": "waqtiga isdiiwaangelinta sannadlaha ah",
},
"so/harrastus-ilmainen/index.html": {
    "registration-ku": "isdiiwaangelintu",
    "registration link-ka": "linkiga isdiiwaangelinta",
    "Sports, art, music iyo clubs": "Ciyaaro, farshaxan, muusig iyo kooxo",
    "Youth services iyo activities": "Adeegyada dhalinyarada iyo hawlo",
    "Programmes gaar ah": "Barnaamijyo gaar ah",
},
"so/helsinki-paivakoti/index.html": {
    "Primary online service-ku waa Edlevo, waxaana jira paper route haddii online-ku suurtagal ahayn.": "Adeegga ugu weyn ee online-ka waa Edlevo. Haddii online-ku kuu suurtageli waayo, waxaad isticmaali kartaa foom warqad ah.",
    "AQOON ma go'aaminayo urgent status ama placement-ka": "AQOON ma go'aamiyo haddii codsigaagu degdeg yahay ama ilmaha meel loo qoondeeyo",
    "official instructions": "tilmaamaha rasmiga ah",
    "Edlevo iyo application-ka": "Edlevo iyo codsiga",
    "Paper application haddii loo baahdo": "Foom warqad ah haddii loo baahdo",
    "Application preferences iyo start date": "Doorashooyinka codsiga iyo taariikhda bilowga",
    "early childhood service guidance": "hagidda varhaiskasvatus",
},
"so/koulu-tuki/index.html": {
    "Tukiopetus ama extra teaching sidee looga hadlaa school-ka?": "Tukiopetus ama caawimaad dheeraad ah sidee dugsiga loogala hadlaa?",
    "Special support ama other learning support yaa laga waydiiyaa?": "Taageerada waxbarashada ee dheeraadka ah yaa dugsiga laga waydiiyaa?",
    "Wilma message maxay ka dhigan tahay?": "Fariinta Wilma maxay ka dhigan tahay?",
    "Hobby ama after-school activity": "Hobby ama hawl dugsiga ka dib",
    "school-ka": "dugsiga",
},
"so/linkit/index.html": {
    "“Official”": "“Rasmi”",
    "“Helpful”": "“Waxtar leh”",
    "resource wax ku ool ah": "il waxtar leh",
    "Shaqo iga dhammaatay / jobseeker": "Shaqo iga dhammaatay / työnhakija",
    "Waxaad noqotay unemployed ama laid off, ama waxaad rabtaa inaad ogaato halka job search rasmi ahaan laga bilaabo.": "Waxaad noqotay shaqo la'aan ama lomautettu, ama waxaad rabtaa inaad ogaato halka shaqo raadinta rasmiga ah laga bilaabo.",
    "Job Market Finland: register as jobseeker": "Työmarkkinatori: iska diiwaangeli työnhakija ahaan",
    "Job Market Finland E-services": "Työmarkkinatori: asiointi",
    "Kela: if you become unemployed": "Kela: haddii aad shaqo la'aan noqoto",
    "CV-ga iyo application-ka": "CV-ga iyo työhakemus-ka",
    "City of Helsinki CV guide, Somali CV material": "Helsinki: hagaha CV-ga iyo material Af-Soomaali ah",
    "Duunitori job application guide": "Duunitori: hagaha työhakemus",
    "AQOON CV guide": "AQOON: hagaha CV-ga",
    "vacancies": "shaqooyinka bannaan",
    "Duunitori open jobs": "Duunitori: shaqooyinka furan",
    "Raadi degree ama qualification": "Raadi waxbarasho ama shahaado",
    "vocational education ama qualification": "ammatillinen koulutus ama shahaado",
    "registration period, test centre": "waqtiga isdiiwaangelinta, goobta imtixaanka",
    "OPH: register for YKI": "OPH: iska diiwaangeli YKI",
    "application-ka caadiga ah": "codsiga caadiga ah",
    "sudden employment/study need waxay yeelan kartaa route gaar ah haddii shuruudaha la caddeeyo": "haddii baahidu si degdeg ah uga dhalato shaqo ama waxbarasho, waxaa jiri kara jid gaar ah haddii shuruudaha la caddeeyo",
    "Kela & unemployment": "Kela & shaqo la'aan",
    "Unemployment benefit route": "Taageerada Kela marka aad shaqo la'aan tahay",
    "Phone / internet contract": "Qandaraaska telefoonka / internetka",
    "Contract or consumer problem": "Dhibaato qandaraas ama arrin macmiil",
},
"so/maxaan-codsan-karaa/index.html": {
    "Jobseeker registration iyo jidka rasmiga ah.": "Työnhakijaksi ilmoittautuminen iyo meesha rasmiga ah ee laga bilaabo.",
    "CV, työhakemus iyo job search.": "CV, työhakemus iyo shaqo raadinta.",
    "Faham test-ka iyo registration-ka rasmiga ah.": "Faham imtixaanka iyo isdiiwaangelinta YKI.",
    "official application": "codsiga rasmiga ah",
    "Eeg links-ka": "Eeg linkiyada",
},
"so/paivakoti-codsi/index.html": {
    "e-service-ka": "adeegga online-ka",
    "application preferences iyo start date": "doorashooyinka codsiga iyo taariikhda bilowga",
    "online ku codsan karin, helidda paper form ama service guidance": "online ku codsan karin, helidda foom warqad ah ama hagidda adeegga",
},
"so/palveluseteli/index.html": {
    "Päiväkoti options": "Ikhtiyaarrada päiväkoti",
    "service voucher": "palveluseteli",
    "Service voucher": "Palveluseteli",
    "Municipal vs private päiväkoti": "Päiväkoti magaalada iyo private päiväkoti",
    "Fee information": "Xogta kharashka",
},
"so/shaqo/index.html": {
    "Deadline dhow": "Codsigu dhowaan ayuu xirmayaa",
},
"so/tampere-paivakoti/index.html": {
    "early childhood education application": "codsiga päiväkoti / varhaiskasvatus",
    "urgent shuruudaha": "shuruudaha codsiga degdegga ah",
    "official instructions-ka": "tilmaamaha rasmiga ah",
    "Application timing iyo start date": "Waqtiga codsiga iyo taariikhda bilowga",
    "Service voucher haddii aad eegayso private option": "Palveluseteli haddii aad eegayso private päiväkoti",
},
"so/vantaa-paivakoti/index.html": {
    "early childhood education application": "codsiga päiväkoti / varhaiskasvatus",
    "VaSa service iyo login": "VaSa iyo gelitaanka adeegga",
    "Municipal vs private/service voucher": "Päiväkoti magaalada, private päiväkoti iyo palveluseteli",
    "Application preferences iyo start date": "Doorashooyinka codsiga iyo taariikhda bilowga",
},
"so/tyonhakijaksi/index.html": {
    "unemployment benefit": "taageerada Kela marka aad shaqo la'aan tahay",
},
"so/tyoton-tyonhakija/index.html": {
    "benefit-kaaga": "taageerada Kela ee aad heli karto",
    "register as a jobseeker": "työnhakijaksi ilmoittautuminen",
    "employment services": "työllisyyspalvelut",
    "employment services-ka": "työllisyyspalvelut",
    "shaqo-doon active ah": "shaqo-doon firfircoon",
},
"so/yaan-nahay/index.html": {
    "Official information, barnaamij, service, company ama qofka saxda ah.": "Xogta rasmiga ah, barnaamijka, adeegga, shirkadda ama qofka saxda ah.",
},
}

for rel, replacements in REPL.items():
    p = ROOT / rel
    if not p.exists() or "/pilke/" in rel:
        continue
    text = p.read_text(encoding="utf-8")
    original = text
    for old, new in replacements.items():
        text = text.replace(old, new)
    if text != original:
        p.write_text(text, encoding="utf-8")
        print("updated", rel)
