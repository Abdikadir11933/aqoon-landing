from pathlib import Path


def replace_once(path, old, new):
    p = Path(path)
    text = p.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{path}: expected exactly one match, got {count}: {old[:100]!r}")
    p.write_text(text.replace(old, new, 1))


public = "caawi/ajankohtaiset/index.html"
registry = "internal/open-programmes.md"
replace_once(public, "<strong>La xaqiijiyey 15.9.2026.</strong>", "<strong>La xaqiijiyey 16.9.2026.</strong>")
replace_once(registry, "Last compiled: 15.9.2026", "Last compiled: 16.9.2026")

old_mun = '''<article class="card"><div class="meta urgent">Helsinki · 15–29 jir · 14.9.–5.10.2026 · Isniin 13–15 · bilaash</div><h3>Mun suunnat, mun polut</h3><p>Kooxdan Ohjaamo waxaad si hagid ah uga fikiraysaa awoodahaaga, danahaaga iyo jidka waxbarasho ama shaqo. Afarta kulan waa 14.9., 21.9., 28.9. iyo 5.10. saacadaha 13–15, Ohjaamo Helsinki, Fredrikinkatu 48. Horay looma isdiiwaangeliyo; waxaa ku filan inaad timaaddo kulanka koowaad.</p><a href="https://nuorten.hel.fi/tapahtuma/?event_id=helsinki%3Aagpr2irxsi">Ohjaamo, rasmi ↗</a></article>'''
new_mun = '''<article class="card"><div class="meta urgent">Helsinki · 15–29 jir · kulanka xiga 21.9.2026 saacadaha 13–15 · bilaash</div><h3>Mun suunnat, mun polut</h3><p>Kooxdan Ohjaamo waxaad si hagid ah uga fikiraysaa awoodahaaga, danahaaga iyo jidka waxbarasho ama shaqo. Kulankii 14.9. wuu dhacay, laakiin bogga rasmiga ahi wuxuu si cad u sheegayaa in qofkii seegay uu weli ku biiri karo <strong>Isniin 21.9.</strong>. Kulamada haray waa 21.9., 28.9. iyo 5.10. saacadaha 13–15, Ohjaamo Helsinki, Fredrikinkatu 48. Horay looma isdiiwaangeliyo.</p><a href="https://nuorten.hel.fi/tapahtuma/?event_id=helsinki%3Aagqkhq7eyi">Ohjaamo, rasmi ↗</a></article>
<article class="card"><div class="meta urgent">Helsinki · 18–29 jir · 30.9.2026 saacadaha 16.30–18.30 · bilaash · isdiiwaangelin looma baahna</div><h3>Harrastusilta – Ohjaamo Helsinki</h3><p>Haddii aad Helsinki ku nooshahay oo aad rabto fikrado cusub oo waqtiga firaaqada ah, waxaad halkan ka heli kartaa macluumaad ku saabsan hiwaayado, meelaha lagu kulmo iyo waxqabadyo bilaash ah oo loogu talagalay dhalinyarada qaangaarka ah. Waxaa kale oo la wadaagayaa talooyin iyo waayo-aragnimo. Goobta: Ohjaamo Helsinki, Fredrikinkatu 48.</p><a href="https://nuorten.hel.fi/tapahtuma/?event_id=helsinki%3Aagqfsu5otm">Ohjaamo, rasmi ↗</a></article>'''
replace_once(public, old_mun, new_mun)
replace_once(public, '<section id="hobby"><h2>⚽ Hiwaayadaha carruurta ee bilaashka ah</h2>', '<section id="hobby"><h2>⚽ Hiwaayadaha carruurta</h2>')

old_hulinat = '''<article class="card"><div class="meta urgent">Vantaa · 19.9.2026 saacadaha 12–15 · carruurta/dhalinyarada u baahan taageero gaar ah + qoysaskooda · bilaash</div><h3>Harrastushulinat – Vantaan Energia Areena</h3><p>Carruurta iyo dhalinyarada naafada ah ama u baahan taageero gaar ah, iyo qoysaskooda, waxay si bilaash ah u tijaabin karaan hiwaayado kala duwan jawi deggan oo taageero leh. Tijaabooyinka waxaa si gaar ah loogu talagalay 7 jir iyo ka weyn, khibrad ama xirfad horena looma baahna. Munaasabadda: Sabti 19.9. saacadaha 12–15, Vantaan Energia Areena.</p><a href="https://www.vantaa.fi/fi/ajankohtaista/uutinen/erityislasten-ja-nuorten-harrastushulinat-kutsuu-kokeilemaan-uusia-harrastuksia-vantaan-energia-areenalle">Vantaa, rasmi ↗</a></article>'''
new_hulinat = old_hulinat + '''
<article class="card"><div class="meta urgent">Vantaa · carruur & dhalinyaro · codsiga ilaa 9.10.2026 · lacag ayaa jirta</div><h3>Vantaan kuvataidekoulu – meelo bannaan dayrta</h3><p>Vantaan kuvataidekoulu wuxuu leeyahay meelo bannaan kooxaha farshaxanka ee dayrta 2026. Liiska hadda jira waxaa ku jira kooxo carruur iyo dhalinyaro ah oo da'doodu kala duwan tahay, goobahana waxaa ka mid ah Kartanonkoski, Kivistö, Korso, Myyrmäki iyo Tikkurila. Waxaa la codsan karaa ilaa <strong>9.10.2026</strong>. Tani <strong>ma aha hiwaayad bilaash ah</strong>: waxbarashadu waa lukukausimaksullinen, sidaas darteed ka hubi kooxda, da'da iyo kharashka bogga rasmiga ah ka hor codsiga.</p><a href="https://kuvataidekoulu.vantaa.fi/fi/ajankohtaista/uutinen/inspiroidu-kokeile-ja-luo-vapaita-paikkoja-vantaan-kuvataidekoulun-lasten-ja-nuorten-taideryhmissa">Vantaa, rasmi ↗</a></article>'''
replace_once(public, old_hulinat, new_hulinat)

replace_once(registry, "  - Status: the published deadline is today, 15.9.2026, or earlier if available places fill; the source does not state a closing clock time, so re-check the form before routing. The pilot runs from September 2026 to June 2027 at the daycares currently listed by Vantaa. The volunteer can agree the frequency and duration with the daycare.", "  - Status (16.9.2026): the published application window ended **15.9.2026** (or earlier if available places filled). Keep this as a closed unpaid volunteer route unless Vantaa publishes a new application round. The pilot itself runs from September 2026 to June 2027 at the daycares listed by Vantaa.")
replace_once(registry, "  - Status: the published group 15.9.–7.10.2026 starts today and runs Tuesdays–Wednesdays 9–12 at Teollisuuskatu. Later groups are 13.10.–4.11. and 10.11.–2.12.2026. No separate public application deadline is stated; because entry is through the employment-services referral and initial interview, check with the responsible expert before promising late entry to a group that has already started.", "  - Status (16.9.2026): the published group **15.9.–7.10.2026** has started and runs Tuesdays–Wednesdays 9–12 at Teollisuuskatu. Later groups are 13.10.–4.11. and 10.11.–2.12.2026. No separate public application deadline is stated; because entry is through the employment-services referral and initial interview, check with the responsible expert before promising late entry to a group that has already started.")
replace_once(registry, "  - Status: recruitment information 15.9.2026, 12–15, Helsinki Employment Services, Malminkatu 34; vocational content 21.–25.9.2026, 9–14, Stadin AO Ilkantie 3. Free for Helsinki employment-services clients.", "  - Status (16.9.2026): the recruitment information session on **15.9.2026, 12–15** at Helsinki Employment Services, Malminkatu 34 has passed; vocational content **21.–25.9.2026, 9–14**, Stadin AO Ilkantie 3 remains upcoming. Free for Helsinki employment-services clients. The checked source does not establish a new direct application route.")

old_reg_mun = '''- **Mun suunnat, mun polut** — Ohjaamo Helsinki
  - Fits: Helsinki young people aged **15–29**.
  - Helps with: direction for work, education choices and future planning in a short group format.
  - Status: four consecutive Mondays — **14.9, 21.9, 28.9 and 5.10.2026**, all **13:00–15:00**, at Ohjaamo Helsinki, Fredrikinkatu 48. **Free**; no advance registration is required; the participant should attend the first session.
  - Official: https://nuorten.hel.fi/tapahtumat/mun-suunnat-mun-polut-ryhma/?event_id=agprq4vzau'''
new_reg_mun = '''- **Mun suunnat, mun polut** — Ohjaamo Helsinki
  - Fits: Helsinki young people aged **15–29**.
  - Helps with: direction for work, education choices and future planning in a short group format.
  - Status (16.9.2026): the first meeting on **14.9** has passed, but the current official page explicitly says people who missed it can still join on **Monday 21.9.2026**. Remaining meetings are **21.9, 28.9 and 5.10.2026**, all **13:00–15:00**, at Ohjaamo Helsinki, Fredrikinkatu 48. **Free**; no advance registration.
  - Official: https://nuorten.hel.fi/tapahtuma/?event_id=helsinki%3Aagqkhq7eyi

- **Harrastusilta — Ohjaamo Helsinki (30.9)**
  - Fits: Helsinki young people aged **18–29** looking for free-time, hobby or community options.
  - Helps with: information about free-time opportunities, hobbies and meeting places for young adults, plus shared tips and experiences.
  - Status: **30.9.2026, 16:30–18:30**, Ohjaamo Helsinki, Fredrikinkatu 48. **Free**; no advance registration.
  - Official: https://nuorten.hel.fi/tapahtuma/?event_id=helsinki%3Aagqfsu5otm'''
replace_once(registry, old_reg_mun, new_reg_mun)

p = Path(registry)
text = p.read_text()
if "#### Vantaan kuvataidekoulu — open autumn 2026 places" not in text:
    marker = "#### Harrastushulinat — Vantaan Energia Areena"
    start = text.find(marker)
    if start == -1:
        raise SystemExit("registry: Harrastushulinat heading not found")
    nxt = text.find("\n#### ", start + len(marker))
    if nxt == -1:
        nxt = text.find("\n## ", start + len(marker))
    if nxt == -1:
        raise SystemExit("registry: could not find section boundary after Harrastushulinat")
    art = '''

#### Vantaan kuvataidekoulu — open autumn 2026 places (children/youth)
- **What:** Open places in Vantaa Art School visual-arts groups for autumn 2026.
- **Audience:** The current open-group list includes children and young people, with groups spanning ages from early childhood through age 20.
- **Locations:** Kartanonkoski, Kivistö, Korso, Myyrmäki and Tikkurila.
- **Registration:** through **9.10.2026** via the school’s current application/open-group route; places are group-specific.
- **Cost:** **Fee-based (lukukausimaksu)**. Do not describe this route as free; verify the applicable fee and any fee-relief rules before promising cost.
- **Official source:** https://kuvataidekoulu.vantaa.fi/fi/ajankohtaista/uutinen/inspiroidu-kokeile-ja-luo-vapaita-paikkoja-vantaan-kuvataidekoulun-lasten-ja-nuorten-taideryhmissa
- **Checked:** 16.9.2026.'''
    p.write_text(text[:nxt] + art + text[nxt:])
