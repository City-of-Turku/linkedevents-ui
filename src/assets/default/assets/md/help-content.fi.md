# Linked Events lyhyesti

* Tapahtumatiedot näkyvät useissa eri sovelluksissa – myös muissa kuin kaupungin omissa.
* Tapahtumia saa syöttää kaupungin luvalla. Niiden ei tarvitse olla kaupungin järjestämiä.
* Tapahtumalle voi antaa useita päivämääriä. Tapahtumasarjalle luodaan automaattisesti ylätapahtuma.
* Tapahtumia voi myös kopioida, perua ja poistaa.
* Huolella syötetyt tiedot helpottavat tapahtuman löytämistä:
    * Eri yhteyksissä ymmärrettävät otsikko, lyhyt kuvaus ja kuvaus.
    * Lyhyt kuvaus näytetään vain listoissa, kuvaus taas tapahtuman omalla sivulla.
    * Jos kohderyhmä on rajattu, kerro siitä kuvauskentässä.
    * Verkkoon sopivaksi muokattu 3:2-vaakakuva, esim. 1200px X 800px.
    * Ylätasoinen asiasanoitus ja luokittelu. Käytä aina joitain suosittuja asiasanoja.

<a href="http://localhost:8080/terms" rel="noreferrer" target="__blank">Linked Events -tapahtumarajapinnan käyttöehdot</a>

Kaupungin tapahtumakalenteri: <a href="http://www.hel.fi/tapahtumat" rel="noreferrer" target="__blank">hel.fi/tapahtumat</a>.

Linked Events -rajapinta: <a href="http://api.hel.fi/linkedevents" rel="noreferrer" target="__blank">api.hel.fi/linkedevents</a>.

Rajapinnan kehittäjäsivu: <a href="https://dev.hel.fi/projects/linked-events/" rel="noreferrer" target="__blank">dev.hel.fi/projects/linked-events/</a>

Rajapinnan palvelupäällikkö on Aleksi Salonen (@hel.fi) ja tekninen kehityspäällikkö RIku Oja (@hel.fi)

<hr>

# Linked Events -tapahtumarajapinnan syöttökäyttöliittymä

### A. Yleistä 

1. **Linked Events on Helsingin kaupungin tapahtumarajapinta.** Rajapintaan syötetyt tapahtumat siirtyvät automaattisesti kaupungin tapahtumakalenteriin, palvelukartalle ja myös muihin kuin kaupungin ylläpitämiin kalenterisovelluksiin. Tapahtuman kuvaus kannattaa siksi laatia helposti ymmärrettäväksi eri käyttöpaikoissa.

2. **Rajapinnan syöttökäyttöliittymä** löytyy osoitteesta linkedevents.hel.fi. Käyttöoikeuden saa kirjautumalla ensin palveluun ja lähettämällä tämän jälkeen oikeuksien vahvistuspyynnön. Syöttöliittymää voi käyttää mistä vain ja myös mobiililaitteilla. Muokkausoikeus on oman organisaation tapahtumille.

3. **Rajapintaan saa syöttää tapahtumia** Helsingin kaupungin luvalla. Tapahtumien ei tarvitse olla kaikille avoimia, mutta rajoitukset on kerrottava selkeästi tapahtuman kuvauksessa.

4. **Käyttöliittymässä voi** a) hakea kaikista kaupungin tapahtumista, b) selata ja muokata oman organisaation tapahtumia ja c) lisätä uusia tapahtumia. Toistuvan tapahtuman kaikki päivät voi lisätä samalla kertaa.

### B. Tapahtuman syöttö

5. **Lisää uusi tapahtuma:** Tapahtuman tiedot on syötettävä ainakin suomeksi. Ruotsin- ja englanninkieliset tiedot on syytä täyttää suurissa ja kielikohderyhmille sopivissa tapahtumissa.

  5.1 **Täytä tiedot niin laajasti ja tarkasti kuin mahdollista.** Lomakkeen ohjetekstit avustavat täyttämisessä.

  5.2 **Pyri aina löytämään tapahtumalle kuva.** Kuvalle voi merkitä käyttöoikeuden CC 4.0 BY <a href="https://creativecommons.org/licenses/by/4.0/" rel="noreferrer" target="__blank">(ks. selitys)</a> tai {`"käyttö vain tapahtuman yhteydessä"`}. Joitakin vapaasti käytettäviä kuvituskuvia löytyy osoitteesta <a href="http://www.hel.fi/tapahtumakuvat" rel="noreferrer" target="__blank">hel.fi/tapahtumakuvat</a>.

    **Muokkaa kuva ennen syöttöä verkkoon sopivaksi**ja 3:2-vaakakuvasuhteeseen, esim. 1200X800px. Olennaista on, että tiedostokoko pysyy kohtuullisena myös mobiilikäyttöön eli mieluiten alle 200 kilotavun (kt).

  5.3 **Useana päivänä toistuvan tapahtuman** lisäämiseksi on Lisää uusi ajankohta -nappi ja säännöllisesti toistuvalle tapahtumalle oma Toistuva tapahtuma -työkalu.

  5.4 **Tapahtuman paikka** valitaan kaupungin toimipisterekisterin paikoista. Osoite- ja muut tiedot haetaan siis automaattisesti, kun oikea paikka löytyy. Jos haluat lisätä uuden toimipisteen, ota yhteyttä <aleksi.salonen@hel.fi>

  5.5 **Tapahtuman luokittelu asiasanoilla on tärkeää,** jotta eri sovellusten käyttäjät löytävät tapahtuman suuresta tapahtumamassasta. Valitse useampi asiasana ja suosi niitä, joita on käytetty useissa tapahtumissa. Asiasanat <a href="https://finto.fi/yso/fi" rel="noreferrer" target="__blank">ks. YSO-sanasto</a> löytyvät useimmiten monikkomuodossa, esim. kirjat, perheet, näytelmät ja maalaukset.

  5.6 **Pääkategoriat ja kohderyhmät** ovat ensijaisesti hel.fi-sivustoa varten, mutta ne näkyvät myös muille rajapinnan hyödyntäjille.

  5.7 **Jos tapahtumalla on useita päivämääräkertoja, voi tallentamisessa kestää hetken.** Jos et saa Julkaise tapahtuma -napin painamisen jälkeen virheilmoitusta, odota hetki, jolloin lomakkeen pitäisi siirtyä seuraavaan näkymään.

### C. Muuta huomioitavaa

6. **Virhetilanteissa** voi lähettää raportin liittymän vasemmasta laidasta löytyvän ikonin kautta. Virheviestiä voi tehostaa lähettämällä sen erikseen myös osoitteeseen <aleksi.salonen@hel.fi> Jälkimmäiseen osoitteeseen voi lisäksi lähettää parannusideoita käyttöliittymään tai kysyä neuvoa.

7. **Uuden tapahtuman tietojen pohjana voi käyttää vanhaa,** avaamalla tapahtuman ja valitsemalla "Kopioi uuden tapahtuman pohjaksi". Omat tapahtumat löytyvät helposti Tapahtumien hallinnasta ja niihin on muokkausoikeus.


<hr>


## Kuvien lisääminen rajapintaan

### Alt-teksti eli kuvan sisällön sanallinen kuvaus

Alt-teksti eli kuvan vaihtoehtoinen teksti on kuvan sanallinen kuvailu sellaisille henkilöille, jotka eivät syystä tai toisesta voi nähdä itse kuvaa. Alt-teksti on pakollinen kenttä.

Kuvaile alt-tekstissä lyhyesti kuvan sisältö, esimerkiksi "Lapsia leikkimässä päiväkodin pihalla". huomioi, että alt-teksti ei ole kuvateksti. Alt-tekstissä ei siis saa kertoa sellaisista asioita, jotka eivät näy suoraan kuvassa.

Alt-tekstin käyttöä säätelee EU:n laajuinen saavutettavuusdirektiivi. Direktiivistä seuraa, että alt-tekstin syöttäminen on pakollista jokaiselle kuvalle.

### Kuvateksti ja kuvaaja

Kuvateksti ja kuvaaja eivät ole pakollisia, mutta ne on hyvä täyttää. Kuvan lisenssissä (katso alta lisää) voidaan kuitenkin vaatia, että kuvaajan nimi mainitaan.

On hyvä käytänöt syöttää kuvaajan nimi aina jos se on tiedossa.

### Lisenssi

Varmista aina, että sinulla tai edustamallasi taholla on oikeus käyttää kuvaa tapahtuman markkinoinnissa. Kuvan käyttöoikeuden varmistaminen on aina kuvan syöttäjän vastuulla.

Myös oikean lisenssin valinta on käyttäjän vastuulla.

Jos kuvaajan tai kuvan oikeudenomistajan kanssa ei ole erikseen muuta sovittu, valitse kuvalle lisenssi "Käyttö rajattu tapahtuman yhteyteen". Kuvaajan nimi ja/tai muu kuvan oikeudenomistaja pitää aina määritellä kohdassa Kuvaaja. <a href="https://api.hel.fi/linkedevents/v1/" rel="noreferrer" target="__blank">Event only -lisenssin määritelmä »</a>

Jos käyttämälläsi kuvalla on laajempi <a href="https://creativecommons.org/licenses/by/4.0/deed.fi" rel="noreferrer" target="__blank">CC BY 4.0 -lisenssi</a> tai vastaava lisenssi, pitää kuvaajan nimi silti aina määritellä kohdassa Kuvaaja.

### Kuvan tekniset vaatimukset

Käytä vaakakuvia, jotka ovat kuvasuhteessa 3:2. Suositeltu mitta kuville on 1200px X 800px. Yli 2 megatavun kokoisia kuvia ei voi syöttää rajapintaan.
