from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Protected campaign pages are intentionally not touched.
TARGETS = [ROOT / "caawi" / "index.html", ROOT / "caawi" / "app.js"]
TARGETS += [p for p in (ROOT / "so").rglob("index.html")]

GLOBAL = {
    "Official links": "Linkiyada rasmiga ah",
    "Official link": "Linkiga rasmiga ah",
    "official links": "linkiyada rasmiga ah",
    "official link": "linkiga rasmiga ah",
    "official websites": "bogagga rasmiga ah",
    "official website": "bogga rasmiga ah",
    "official source-ka": "bogga rasmiga ah",
    "official source": "bogga rasmiga ah",
    "official information": "xogta rasmiga ah",
    "official criteria": "shuruudaha rasmiga ah",
    ">Official<": ">Rasmi<",
    ">Helpful<": ">Waxtar leh<",
    ">Independent<": ">Madax-bannaan<",
    "programme-ka": "barnaamijka",
    "programme ama": "barnaamij ama",
    "programme,": "barnaamij,",
    "programmes": "barnaamijyo",
    "programme": "barnaamij",
    "deadline-ka": "taariikhda ugu dambeysa",
    "deadline": "taariikhda ugu dambeysa",
    "eligibility": "shuruudaha",
    "palkkatuki-route": "jidka palkkatuki",
    "Quality check:": "Hubinta tayada:",
    "Core links-ka": "Linkiyada muhiimka ah",
    "weekly automated link-health check": "hubin otomaatig ah oo toddobaadle ah oo linkiyada ah",
    "liis random ah": "liis aan kala sooc lahayn",
    "resources waxtar leh": "ilo waxtar leh",
    "official information,": "xogta rasmiga ah,",
}

PER_FILE = {
    "caawi/index.html": {
        "Ma rabtaa qof kaa caawiya inaad fahanto waxa aad heli karto?": "Ma rabtaa qof kaa caawiya inaad fahanto fursadaha kuu jira?",
        "Immisa jir buu ama bay yahay ilmahaagu?": "Immisa jir ayuu ilmahaagu yahay?",
        "Kuma caawin karo haddii aanan ogaan waxa aad u baahan tahay. Sii wad, waxay qaadanaysaa wax yar oo keliya.": "Si aan kuu caawiyo, waxaan u baahanahay inaan ogaado waxa aad u baahan tahay. Sii wad; wax yar oo keliya ayaa ka haray.",
    },
    "caawi/app.js": {
        "Hel meel xannaano ama faham fursadaha jira": "Hel päiväkoti ama faham fursadaha kuu jira",
        "Diyaarinta dugsiga ka hor fasalka 1aad": "Waxbarashada ilmaha ka hor fasalka 1aad",
        "Faahfaahinta telefoonka ayaan ka hadli karnaa": "Faahfaahinta marka aan ku soo waco ayaan ka wada hadli karnaa",
        "Hel waxqabad ama hobby ku habboon ilmaha": "Hel ciyaar ama hobby ku habboon ilmaha",
        "Caawimaad codsi ama isdiiwaangelin": "Caawimaad ku saabsan codsi ama isdiiwaangelin",
        "Ganacsi aan bilaabo": "Bilaabidda ganacsi",
        "Caddee heerkaaga Finnish-ka": "YKI ama heerka Finnish-ka",
        "YKI wuxuu caddeeyaa heerka luqaddaada Finnish-ka": "Faham YKI iyo waxa uu ka sheegayo heerka Finnish-kaaga",
        "Dhammaystir dugsi ama hel shahaadadaada ugu horreysa": "Dhammaystir waxbarasho ama hel shahaadadaada ugu horreysa",
        "Hel adeeg ama taageero aad ka bilaabi karto": "Hel adeeg ama taageero ku habboon xaaladdaada",
    },
    "so/index.html": {
        "Maxaad isku dayaysaa inaad xalliso?": "Maxaad caawimaad uga baahan tahay?",
        "Waxaad rabtaa inaad shaqada u dhaqaaqdo.": "Waxaad rabtaa shaqo ama inaad shaqo raadinta bilowdo.",
        "Waxaad rabtaa waddo waxbarasho oo cad.": "Waxaad rabtaa inaad wax barato laakiin ma hubtid meesha laga bilaabo.",
        "Job Market Finland, CV, jobs iyo barnaamijyo": "Työmarkkinatori, CV, shaqooyin iyo barnaamijyo",
        "Finnish, YKI, Studyinfo iyo koulutus": "Finnish, YKI, Opintopolku iyo waxbarasho",
        "Shaqo raadis, CV, tababar ama barnaamij": "Shaqo raadis, CV, tababar ama barnaamij shaqo",
        "Macluumaadku wuxuu ku jiri karaa website rasmi ah, Wilma, email ama erayo Finnish ah oo aadan garanayn.": "Macluumaadku wuxuu ku jiri karaa bog rasmi ah, Wilma, email ama erayo Finnish ah oo aadan garanayn.",
    },
    "so/sababta-aqoon/index.html": {
        "Macluumaadka wuxuu ku jiraa bogagga rasmiga ah, Wilma, emails ama bogag badan oo kala duwan.": "Macluumaadku wuxuu ku kala jiraa bogagga rasmiga ah, Wilma, email iyo meelo badan oo kala duwan.",
        "Markaas barnaamij, taariikhda ugu dambeysa ama fursad ayaa dhaafaysa.": "Markaas waxaa dhici karta in codsigu xirmo ama fursaddu kaa dhaafto.",
        "Waxaan rabnaa inaan hagaajino linkigaas jaban": "Waxaan rabnaa inaan hagaajino xiriirkaas go'ay",
        "Waxaan ka raadinnaa bogga rasmiga ah iyo barnaamijka ama adeegga arrintaada khuseeya.": "Waxaan ka raadinnaa bogga rasmiga ah iyo barnaamijka ama adeegga ku habboon arrintaada.",
        "AQOON ma bixiso go'aan sharci ama rasmi ah. Waxaan ku xireynaa xogta rasmiga ah, adeegga ama qofka saxda ah, waxaana kaa caawinnaa inaad fahanto oo aad tallaabada xigta qaaddo.": "AQOON ma bixiso go'aan sharci ama rasmi ah. Waxaan kuu helnaa xogta rasmiga ah, adeegga ama qofka saxda ah, kadibna waxaan kaa caawinnaa inaad fahanto tallaabada xigta.",
    },
    "so/kela/index.html": {
        "AQOON waxay kaa caawin kartaa hagidda.": "AQOON waxay kaa caawin kartaa inaad ogaato meesha saxda ah ee aad ka bilaabi karto.",
        "marka warqad ama nidaam kuu caddaado la'yahay": "marka warqad ama nidaam kuu caddayn waayo",
        "Haddii arrintaadu tahay mid mustaqbalka ah, weli hadda ii soo sheeg.": "Haddii aad arrintan u baahan doonto mustaqbalka, hadda ayaad noo soo sheegi kartaa.",
    },
    "so/paivakoti/index.html": {
        "päiväkoti, esiopetus ama caawimaad codsiga ilmaha": "päiväkoti, esiopetus ama caawimaad ku saabsan codsiga ilmaha",
        "Faahfaahinta xaaladdaada telefoonka ayaan ka wada hadli karnaa.": "Faahfaahinta xaaladdaada marka aan ku soo waco ayaan ka wada hadli karnaa.",
    },
    "so/shaqo/index.html": {
        "Turvallisuusala + S2-tuki: haku 4.9.2026 asti. Elintarvikeala + kielituki: haku 7.9.2026 asti.": "Turvallisuusala + S2-tuki: codsigu wuxuu furan yahay ilaa 4.9.2026. Elintarvikeala + kielituki: codsigu wuxuu furan yahay ilaa 7.9.2026.",
        "Haddii aadan weli garanayn shaqada/alaa aad rabto: suomen kieli, digitaidot, työelämä iyo henkilökohtainen jatkopolku.": "Haddii aadan weli hubin shaqada ama alan aad rabto, Kielituettu ryhmävalmennus wuxuu kaa caawin karaa Finnish-ka, xirfadaha digital-ka, fahamka shaqada Finland iyo qorshaha tallaabada xigta.",
        "Työnantajalle maksettava tuki voi joissain tilanteissa helpottaa työttömän työnhakijan palkkaamista. Oma työllisyyspalvelu arvioi mahdollisuuden; sitä ei pidä olettaa automaattiseksi.": "Palkkatuki waa taageero loo-shaqeeyaha la siin karo xaaladaha qaarkood marka uu shaqaaleysiinayo qof shaqo-doon ah. Työllisyyspalvelut ayaa hubiya haddii xaaladdu ku habboon tahay; taageeradu si otomaatig ah uma imanayso.",
        "Hore ii soo sheeg.": "Haddii aad shaqo u baahan doonto bilo kadib, hadda noo soo sheeg.",
        "Faahfaahinta telefoonka ayaan ka wada hadli karnaa.": "Faahfaahinta marka aan ku soo waco ayaan ka wada hadli karnaa.",
    },
    "so/waxbarasho/index.html": {
        "hadda ii soo sheeg.": "hadda noo soo sheeg.",
        "Maahan muuttaneille vanhemmille. Suomen kieltä ei tarvitse osata, lapsen voi ottaa mukaan. Suomen kieli, yhteiskunta, koulu/päiväkoti iyo jatkopolku opintoihin tai työhön.": "Vanhemmat mukaan (VAMU) waxaa loogu talagalay waalidiinta Vantaa ee Finland u soo guuray. Finnish hore uma baahnid, ilmahana waad la iman kartaa. Waxaa lagu bartaa Finnish, nolol-maalmeedka Finland iyo arrimaha koulu/päiväkoti, waxaana lagaa caawinayaa tallaabada xigta ee waxbarasho ama shaqo.",
        "Ku habboon qof aan työnhakija ahayn, myös kotona lasta hoitaville. Voi sisältää suomen/ruotsin koulutusta, yhteiskuntaorientaatiota ja muuta kotoutumista tukevaa toimintaa.": "Adeeggan wuxuu ku habboon yahay qof Helsinki jooga oo aan työnhakija ahayn, oo ay ku jiraan waalidiinta guriga carruurta ku haya. Waxa ku jiri kara Finnish ama Swedish, yhteiskuntaorientaatio iyo taageero kale oo kotoutuminen ah.",
        "Yli 18-vuotiaille espoolaisille maahan muuttaneille: osaamisen tunnistaminen, ammatillinen koulutus, työnhaku iyo opintoihin ohjaus.": "Omnia OSKE waxaa loogu talagalay dadka Espoo jooga ee 18 jir ama ka weyn ee Finland u soo guuray. Waxay kaa caawin karaan aqoonsiga xirfadahaaga, ammatillinen koulutus, shaqo raadinta iyo waddada waxbarasho.",
        "Helidda koorso Finnish ah, aikuiskoulutus, fahamka waddooyinka waxbarasho": "Helidda koorso Finnish ah, waxbarashada dadka waaweyn, fahamka waddooyinka waxbarasho",
    },
    "so/linkit/index.html": {
        "Boggan ma aha liis aan kala sooc lahayn ah.": "Boggan ma aha liis linkiyo ah oo aan kala sooc lahayn.",
        "dhibaatada → linkiga rasmiga ah → waxa aad halkaas ka sameyneyso": "waxa aad u baahan tahay → linkiga rasmiga ah → waxa aad halkaas ka samaynayso",
        "AQOON ma go'aamiso shuruudaha, benefit ama xuquuq sharci.": "AQOON ma go'aamiso shuruudaha, lacagta Kela ama xuquuq sharci.",
        "“Rasmi” waxay ka dhigan tahay link hay'ad ama magaalo rasmi ah. “Waxtar leh” waa resource wax ku ool ah, laakiin ma aha hay'adda go'aanka sameysa.": "“Rasmi” waxay ka dhigan tahay link ka socda hay'ad ama magaalo rasmi ah. “Waxtar leh” waa il kaa caawin karta, laakiin ma aha hay'adda go'aanka gaarta.",
        "Old information about työmarkkinatuki/peruspäiväraha can be outdated. In 2026 Kela moved to general social security benefit for this route.": "Xogtii hore ee työmarkkinatuki iyo peruspäiväraha way duugoobi kartaa. 2026 Kela waxay beddeshay nidaamkan, sidaas darteed hubi xogta Kela ee hadda jirta.",
        "Phone / internet contract": "Qandaraaska telefoonka / internetka",
        "Contract or consumer problem": "Dhibaato qandaraas ama arrin macmiil",
    },
    "so/ajankohtaiset/index.html": {
        "programmes iyo adeegyo hadda firfircoon": "barnaamijyo iyo adeegyo hadda socda",
        "Deadlines iyo openings way is beddeli karaan.": "Taariikhaha codsiga iyo waqtiga ay furan yihiin way is beddeli karaan.",
        "AQOON ma oranayo inaad si toos ah u qalanto; waxaan kaa caawinnaa inaad hubiso shuruudaha rasmiga ah iyo jidka saxda ah.": "AQOON ma oranayo inaad si toos ah u buuxinayso shuruudaha. Waxaan kaa caawinnaa inaad hubiso shuruudaha rasmiga ah iyo meesha saxda ah ee laga bilaabo.",
        "Maahan muuttaneille työnhakijoille Helsingissä. Ammatillinen työvoimakoulutus, jossa on kielituki.": "Waxaa loogu talagalay dadka Helsinki jooga ee Finland u soo guuray oo työnhakija ah. Waa ammatillinen työvoimakoulutus leh taageero luqadeed.",
        "Maahan muuttaneille työnhakijoille. Koulutus avustaviin tehtäviin ja työelämään.": "Waxaa loogu talagalay dadka Finland u soo guuray ee työnhakija ah. Koulutus-ku wuxuu u diyaariyaa shaqooyinka kaalmada ah iyo gelitaanka työelämä.",
        "Maahan muuttaneelle työnhakijalle: osaamisen tunnistaminen, opinto-ohjaus, digivalmennus, uraohjaus, suomen kieli iyo koulutuspolut.": "Qofka Vantaa jooga ee Finland u soo guuray oo työnhakija ah wuxuu ka heli karaa aqoonsiga xirfadaha, opinto-ohjaus, digivalmennus, uraohjaus, Finnish iyo waddooyin waxbarasho.",
        "Maahan muuttaneille espoolaisille työnhakijoille: osaamisen tunnistaminen, ammatillinen koulutus, työnhaku iyo opintoihin ohjaus.": "Dadka Espoo jooga ee Finland u soo guuray oo työnhakija ah waxay ka heli karaan aqoonsiga xirfadaha, ammatillinen koulutus, shaqo raadinta iyo hagidda waxbarashada.",
        "Korkeakoulutetulle maahanmuuttajalle, joka täyttää palvelun työnhakija-, tutkinto- iyo kielikriteerit. Uraohjaus, työnhaku, workshops iyo rekrytointitapahtumat.": "Waxaa loogu talagalay qof Finland u soo guuray oo korkeakoulututkinto leh, kana buuxiya shuruudaha työnhakija, tutkinto iyo luqadda. Waxaa jira uraohjaus, shaqo raadis, workshops iyo rekrytointitapahtumat.",
        "Joissain tilanteissa työnantaja voi saada tukea työttömän työnhakijan palkkaamiseen. Oma työllisyyspalvelu arvioi mahdollisuuden; tuki ei tule työntekijälle eikä sitä pidä olettaa automaattiseksi.": "Xaaladaha qaarkood loo-shaqeeyaha ayaa heli kara palkkatuki marka uu shaqaaleysiinayo qof työnhakija ah. Työllisyyspalvelut ayaa qiimeeya xaaladda; lacagtu shaqaalaha si toos ah uma timaaddo, mana aha wax otomaatig ah.",
        "Vantaalaisille maahan muuttaneille vanhemmille, joilla on voimassa oleva oleskelulupa. Suomen kieltä ei tarvitse osata. Suomen kieli, kotoutuminen, vanhemmuus iyo jatkopolut kohti opintoja ja työtä.": "Waxaa loogu talagalay waalidiinta Vantaa ee Finland u soo guuray oo leh oleskelulupa shaqaynaya. Finnish hore uma baahnid. Barnaamijku wuxuu ka kooban yahay Finnish, kotoutuminen, waalidnimo iyo waddooyin loo maro waxbarasho ama shaqo.",
        "Espoon, Omnian iyo Koto-Espoon palvelumalli tukee maahan muuttaneen kotivanhemman suomen opiskelua; lastenhoito mahdollistaa osallistumista.": "Espoo, Omnia iyo Koto-Espoo waxay bixiyaan koorsooyin Finnish ah oo loogu talagalay waalidiinta guriga jooga ee Finland u soo guuray. Lastenhoito ayaa ka caawin karta waalidka inuu ka qayb galo.",
        "Helsinkiläiselle, joka ei ole työnhakija mutta tarvitsee kotoutumista tukevaa palvelua. Voi sisältää kieliopintoja, yhteiskuntaorientaatiota iyo muuta henkilökohtaiseen suunnitelmaan kuuluvaa toimintaa.": "Waxaa loogu talagalay qof Helsinki jooga oo aan työnhakija ahayn laakiin u baahan taageero kotoutuminen. Waxa ku jiri kara barashada luqadda, yhteiskuntaorientaatio iyo taageero kale oo ku jirta qorshaha qofka.",
        "Tampereella maahanmuuttajanaisille: suomi, työnhaku, suomalainen yhteiskunta, digitaidot iyo oman talouden hallinta. Kohderyhmään kuuluu myös kotoutumisajan ylittäneitä ja työntekijöiden/opiskelijoiden puolisoita.": "Waxaa loogu talagalay haweenka Tampere ee Finland u soo guuray. Waxaa lagu bartaa Finnish, shaqo raadis, bulshada Finland, xirfadaha digital-ka iyo maamulka dhaqaalaha. Qaar ka mid ah dadka kotoutumisaika ka dhammaaday iyo xaasaska shaqaalaha ama ardayda ayaa sidoo kale ka mid noqon kara dadka loogu talagalay.",
        "Helsinkiläiselle työttömälle, joka ei vielä tiedä omaa alaa: suomen kieli, digitaidot, työelämä iyo henkilökohtainen jatkopolku.": "Waxaa loogu talagalay qof Helsinki jooga oo shaqo la'aan ah oo aan weli hubin alan uu rabo. Waxaa ku jira Finnish, xirfadaha digital-ka, fahamka työelämä iyo qorshe tallaabada xigta.",
        "Omniaan voi hakea moniin ammatillisiin koulutuksiin myös jatkuvan haun kautta. Tämä voi olla vaihtoehto, vaikka kevään yhteishaku olisi jo päättynyt.": "Omnia waxay leedahay ammatillinen koulutus badan oo lagu codsan karo jatkuva haku. Taasi waxay noqon kartaa waddo kale xitaa haddii yhteishaku uu dhammaaday.",
        "Työ, koulutus, CV, asuminen, raha, hyvinvointi iyo maahanmuuttoon liittyvät kysymykset yhdestä paikasta. Voit tulla ilman ajanvarausta.": "Ohjaamo waxaad hal meel uga heli kartaa caawimaad shaqo, waxbarasho, CV, guri, lacag, hyvinvointi iyo arrimaha la xiriira maahanmuutto. Waxaad tegi kartaa adigoon ajanvaraus samayn.",
        "15–29-vuotiaalle, joka haluaa löytää omia vahvuuksiaan ja selkeyttää opiskelu- tai työpolkua. Neljä tapaamista; ei ennakkoilmoittautumista.": "Waxaa loogu talagalay 15–29 jir doonaya inuu fahmo awoodihiisa oo uu caddeeyo jidka waxbarasho ama shaqo. Waxaa jira afar kulan, mana jiro ennakkoilmoittautuminen.",
        "Nuori voi käyttää seteliä kesätyöpaikan hakemiseen hyväksytyltä työnantajalta. Työnantaja maksaa palkan ja hakee setelituen kaupungilta.": "Qofka dhalinyarada ah wuxuu kesätyöseteli u isticmaali karaa raadinta shaqo xagaaga ee loo-shaqeeye la oggol yahay. Loo-shaqeeyaha ayaa mushaharka bixiya, kadibna magaalada ka codsada taageerada seteli-ga.",
        "3.–9.-luokkalaisille maksuttomia harrastuksia kouluilla: liikuntaa, kulttuuria, koodausta, pelejä iyo muuta.": "Ardayda fasallada 3–9 waxaa dugsiyada loogu qabtaa harrastuksia bilaash ah sida ciyaaro, dhaqan, coding, games iyo waxyaabo kale.",
        "Lähes 300 maksutonta ohjattua harrastusryhmää peruskoululaisille lukuvuodelle 2026–2027.": "Carruurta peruskoulu waxaa loo hayaa ku dhowaad 300 kooxood oo harrastus ah oo bilaash ah sannad-dugsiyeedka 2026–2027.",
    },
}

# Common phrases repeated across topic pages.
COMMON_PHRASES = {
    "Faahfaahinta telefoonka ayaan ka wada hadli karnaa.": "Faahfaahinta marka aan ku soo waco ayaan ka wada hadli karnaa.",
    "Official ↗": "Rasmi ↗",
    "official ↗": "rasmi ↗",
    "Official criteria ↗": "Shuruudaha rasmiga ah ↗",
    "Current Kela unemployment benefits ↗": "Kela: taageerada shaqo la'aanta ee hadda jirta ↗",
    "What to do if unemployed ↗": "Kela: waxa la sameeyo haddii aad shaqo la'aan noqoto ↗",
}


def apply_replacements(text: str, repl: dict[str, str]) -> tuple[str, int]:
    count = 0
    for old, new in repl.items():
        n = text.count(old)
        if n:
            text = text.replace(old, new)
            count += n
    return text, count


touched = []
for path in TARGETS:
    if not path.exists():
        continue
    rel = path.relative_to(ROOT).as_posix()
    # Do not touch protected Pilke campaign content if it is ever moved under /so.
    if rel.startswith("pilke/") or "/pilke/" in rel:
        continue
    original = path.read_text(encoding="utf-8")
    text, n1 = apply_replacements(original, GLOBAL)
    text, n2 = apply_replacements(text, COMMON_PHRASES)
    text, n3 = apply_replacements(text, PER_FILE.get(rel, {}))
    if text != original:
        path.write_text(text, encoding="utf-8")
        touched.append((rel, n1 + n2 + n3))

print(f"Somali rewrite updated {len(touched)} files")
for rel, count in touched:
    print(f"  {rel}: {count} replacements")
