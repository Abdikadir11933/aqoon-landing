from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

# Update Finnish privacy notice to match consent-gated analytics.
p=ROOT/'tietosuoja'/'index.html'
t=p.read_text(encoding='utf-8')
t=t.replace('Kun käytät <strong>aqoon.live/caawi</strong>-lomaketta, tallennamme lomakkeen toimivuuden arviointia varten selain- ja istuntokohtaiset tekniset tunnisteet sekä esimerkiksi sen, mistä lähteestä käynti tuli, millä laiteluokalla lomaketta käytettiin ja mihin lomakkeen vaiheeseen asti edettiin. Valitut kaupunki-, pääasiallinen tarve-, ikäryhmä- ja alatarve voivat sisältyä tähän käytettävyysdataan.', 'Kun käytät <strong>aqoon.live/caawi</strong>-lomaketta, lomake kysyy erikseen suostumuksen ei-välttämättömään käytettävyysanalytiikkaan. Jos hyväksyt analytiikan, voimme tallentaa selain- ja istuntokohtaisia teknisiä tunnisteita sekä esimerkiksi sen, mistä lähteestä käynti tuli ja mihin lomakkeen vaiheeseen asti edettiin. Valitut kaupunki-, pääasiallinen tarve-, ikäryhmä- ja alatarve voivat sisältyä tähän käytettävyysdataan. Lomake toimii myös ilman analytiikkasuostumusta.')
t=t.replace('Selainkohtainen tunniste säilytetään selaimen omassa paikallisessa tallennustilassa ja istuntotunniste selaimen istuntotallennustilassa. Näitä tietoja käytetään AQOONin oman palvelupolun mittaamiseen ja laadun parantamiseen, ei mainosprofiilin rakentamiseen.', 'Pysyvä selainkohtainen analytiikkatunniste tallennetaan vain, jos hyväksyt analytiikan. Välttämättömiä teknisiä tunnisteita voidaan käyttää lomakkeen toiminnan, kuten saman pyynnön kaksoislähetyksen estämisen, toteuttamiseen. Analytiikkavalinta muistetaan selaimessa, jotta samaa kysymystä ei tarvitse esittää jokaisella sivulatauksella. Tietoja käytetään AQOONin oman palvelupolun mittaamiseen ja laadun parantamiseen, ei mainosprofiilin rakentamiseen.')
if '/disclaimer' not in t:
    t=t.replace('</main>', '<section class="sec"><div class="wrap-narrow"><div class="panel"><h2>Riippumattomuus</h2><p class="body-copy">AQOON on itsenäinen neuvonta- ja palvelunavigointipalvelu. Emme ole viranomainen emmekä Kelan, Migrin, kuntien, hyvinvointialueiden tai työllisyyspalvelujen edustaja. <a href="/disclaimer">Lue vastuunrajaus ja riippumattomuus.</a></p></div></div></section></main>',1)
p.write_text(t,encoding='utf-8')

# Add a compact independence notice to the Finnish public homepage.
p=ROOT/'index.html'
t=p.read_text(encoding='utf-8')
if 'aqoon-independence-note' not in t:
    note='''<section class="aqoon-independence-note" aria-label="AQOONin riippumattomuus"><div class="wrap"><div style="margin:24px 0;padding:16px 18px;border:1px solid #e4dfd3;border-radius:16px;background:#fff;color:#56616e;font-size:14px;line-height:1.55"><strong style="color:#0E2440">AQOON on itsenäinen palvelunavigointipalvelu.</strong> Emme ole viranomainen emmekä Kelan, Migrin, kuntien, hyvinvointialueiden tai työllisyyspalvelujen edustaja. Emme tee viranomais-, etuus-, lupa-, palvelu- tai valintapäätöksiä emmekä takaa lopputulosta. <a href="/disclaimer" style="color:#08736e;font-weight:700">Vastuunrajaus</a> · <a href="/tietosuoja" style="color:#08736e;font-weight:700">Tietosuoja</a></div></div></section>'''
    t=t.replace('</main>',note+'</main>',1)
p.write_text(t,encoding='utf-8')
print('final trust links updated')
