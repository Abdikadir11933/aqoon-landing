# design-ref — B2B-sivuston lähdeaineisto

Nämä tiedostot ovat suunnittelutyökalun vientejä, eivät julkaistavaa koodia. Ne säilytetään, jotta B2B-sivuston hyväksytty rakenne, sisältöhierarkia ja mitat ovat jäljitettävissä.

| Tiedosto | Vastaava tuotantosivu |
|---|---|
| `Etusivu.dc.html` | `/` |
| `tapaus.dc.html` | `/tapaus` |
| `menetelma.dc.html` | `/menetelma` |
| `paketit.dc.html` | `/paketit` |
| `perustaja-source.png` | perustajan alkuperäinen kuva |

`Kaksi puolta -vaihtoehdot.dc.html` on aikaisempi luonnos. Sitä ei käytetä sisältö- tai toteutuslähteenä. Etusivun hyväksytty kaksipuolinen kaavio on `Etusivu.dc.html`-tiedostossa.

## Toteutussääntö

Vientitiedostot sisältävät suunnittelutyökalun omia elementtejä ja templaatteja, kuten `<x-dc>`, `<helmet>`, `<dc-import>` ja `{{ ... }}`. Niitä ei kopioida tuotantoon sellaisenaan.

Tuotantosivut ovat semanttista staattista HTML:ää. Jaettu responsiivinen navigaatio ja mobiilivalikko ovat `assets/site.css`- ja `assets/site.js`-tiedostoissa. Vientien inline-mitat säilytetään silloin, kun ne ovat osa hyväksyttyä visuaalista rakennetta.

## Sisältömalli

- Etusivun silta: organisaatiolla on palvelu, ihmisellä tarve ja AQOON rakentaa puuttuvan käytännön reitin.
- Vaihe 1: tutkimus ja rajattu pilotti, joka löytää katkoksen ja määrittää jatkon.
- Vaihe 2: jatkuva tavoittamisen ja palvelun aloituksen toteutus.
- Asiakaspolun ja materiaalien kehitys: vain todetusta tarpeesta aktivoitava lisätyö.
- Henkilöstön valmennus: erillinen, todellisiin tilanteisiin perustuva palvelu.
- Julkisia euromääräisiä hintoja ei esitetä.

Suunnittelulähteiden poistaminen vaatii edelleen omistajan vahvistuksen.
