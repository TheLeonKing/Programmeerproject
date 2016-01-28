# Trein of Auto
Leon Kempers, 10626646

## Beschrijving (probleemdefinitie)
We kennen het allemaal: met half dichtgeknepen oogjes kruip je 's ochtends uit bed en wanneer je de gordijnen opentrekt, zie je dat Nederland bedekt is onder een dik pak sneeuw. Je krijgt direct een vervelend gevoel in je onderbuik en wanneer je de tv aanzet, wordt je angst bevestigd: het is een chaos op zowel de weg als het spoor. Je hebt echter een belangrijke afspraak en moet zo snel mogelijk in Maastricht zijn. Waar kies je voor: de trein of de auto?

Of misschien heb je wel een dure maand gehad. Na de kerstcadeautjes voor je familie en die wintervoorraad drank voor oud en nieuw, moet je concluderen dat je nog heel veel maand overhebt an het einde van je geld. Waar kies je voor als budgetbewuste reiziger: de trein of de auto?

De webapplicatie **Trein of Auto** is bedoeld om antwoord te geven op deze vragen. Je geeft je beginlocatie en eindbestemming op en door verschillende databronnen te combineren, berekent de applicatie automatisch wat goedkoper en/of sneller is: de auto of de trein.

Maar **Trein of Auto** gaat verder dan dat. Veel verder. We helpen je namelijk ook bij alle andere zaken die belangrijk zijn voor je reis. Welke benzinestations zitten er op jouw route en welke is het goedkoopst? Waar kun je parkeren eens je op je bestemming bent aangekomen? **Trein of Auto** weet het.

Daarnaast vinden we het milieu belangrijk. Daarom maakt **Trein of Auto** je bewust van de gevolgen die jouw reis heeft voor de wereld om je heen. Je kunt in één oogopslag de CO2-uitstoot van een trein- en autoreis vergelijken en ziet tevens hoeveel bomen er nodig zijn om deze uitstoot te absorberen. Ook kun je de CO2-uitstoot van de gemeentes op je begin- en eindlocatie vergelijken met de CO2-uitstoot in de rest van Nederland. Je kunt zelfs zien hoe de CO2-uitstoot over de jaren heen is veranderd in jouw gemeente!

**Trein of Auto** is een complete webapplicatie die inzicht geeft in de drie aspecten die voor jouw reis het belangrijkst zijn: de kosten, de reisduur en het milieu. Zo helpt **Trein of Auto** jou bij het maken van een bewuste keuze.


## Technisch design
Om te voorkomen dat dit een gigantisch bestand wordt, heb ik ervoor gekozen mijn Design-document te updaten. Deze is te vinden onder de naam [DESIGN-UPDATED.md] (https://github.com/TheLeonKing/Programmeerproject/blob/master/DESIGN-UPDATED.md) en beschrijft alle aspecten van het technisch design. De originele versie, die ik maakte aan het einde van week 1, draagt de naam [DESIGN-ORIGINAL.md] (https://github.com/TheLeonKing/Programmeerproject/blob/master/DESIGN-ORIGINAL.md).


## Wijzigingen en uitdagingen
Dit hoofdstuk beschrijft de wijzigingen en uitdagingen die ik tegenkwam tijdens het programmeren van **Trein of Auto**.

### Wijzigingen
Sinds ik mijn originele Design-document opstelde, heb ik flink wat wijzigingen doorgevoerd. De belangrijkste zijn als volgt:
* Ik heb besloten om **Trein of Auto** veel uitgebreider te maken. Je kunt je reis dus niet alleen vergelijken op het gebied van prijs en reisduur; ik heb besloten om alle factoren die belangrijk zijn (benzinestations, parkeerplaatsen, CO2-uitsoot, etc.) te visualiseren.
* Ik heb meer nadruk gelegd op het milieu. Dit aspect kwam in mijn oorspronkelijke plan niet aan bod, maar speelt in het eindproduct een grote rol.
* Oorspronkelijk was ik van plan om een "resultatenpagina" te maken met daarop de belangrijkste informatie en dan nog een "detailpagina" met gedetailleerdere visualisaties. Uiteindelijk heb ik ervoor gekozen om alles op de resultatenpagina te plaatsen, maar de "detailvisualisaties" te verbergen in een [accordion] (https://jqueryui.com/accordion/). Zo wordt de gebruiker niet overweldigd en krijgt hij nooit meer dan een paar grafieken tegelijkertijd te zien, zonder dat hij tussen pagina's hoeft te wisselen.
* Benzinestations spelen een grote rol in de applicatie, terwijl dit oorspronkelijk niet het geval was. **Trein of Auto** visualiseert alle benzinestations op de route en vergelijkt tevens de prijzen van de grootste benzinestations.
* Het reisadvies is veel uitgebreider geworden. De uiteindelijke applicatie visualiseert het reisadvies op een kaart, schrijft het uit en toont parkeerplaatsen rond de bestemming.
* Ik heb veel milieu-gerelateerde visualisaties toegevoegd. Denk aan de bar chart van de CO2-uitstoot, de bomenvisualisatie, de gemeentekaart en de line chart behorende bij deze kaart. Deze maakten allemaal geen deel uit van mijn oorspronkelijke plan.

### Rechtvaardiging van wijzigingen
Ik ben ervan overtuigd dat **Trein of Auto** door de wijzigingen een betere en completere applicatie is geworden. Door bijvoorbeeld milieu-gerelateerde visualisaties toe te voegen kan de gebruiker een beter overwogen besluit maken. Ook de toevoeging van handige informatie als benzinestations op de route en parkeerplaatsen op de bestemming maken **Trein of Auto** naar mijn idee beter. Doordat de gebruiker deze informatie vooraf kan zien, is hij tijdens zijn reis minder tijd kwijt aan het zoeken naar deze faciliteiten. Uiteindelijk is **Trein of Auto** dus veel meer een "one-stop"-applicatie geworden: één applicatie waar de gebruiker al zijn benodigde informatie vindt. Dat sluit dus precies aan bij mijn originele filosofie: één applicatie maken die informatie die reeds op verschillende plaatsen beschikbaar is, combineert en visualiseert!

### Uitdagingen
Ik ben veel uitdagingen tegengekomen tijdens het maken van **Trein of Auto**. De vier grootste zijn als volgt:
* Hoewel ik de Google Maps API kan vragen om OV-reizen die de voorkeur geven aan de trein, kan het voorkomen dat de API een reis retourneert die toch nog busstukken bevat. Echter, de busmaatschappijen bieden geen API die het mogelijk maakt om de prijzen van deze busreizen op te vragen. Ik heb letterlijk dagenlang gezocht naar alternatieven, maar kon deze niet vinden (behalve een 9292 API-licentie van 700 euro per jaar). Ik wilde echter wel dat de getoonde prijs accuraat was. Ik heb deze complicatie uiteindelijk opgelost door te elke stap van de geretourneerde reis te doorlopen en te controleren of dit een OV-stap is die niet met de trein gemaakt wordt (maar bijvoorbeeld met de bus of metro). Als dit het geval was, heb ik het begin- en eindpunt van deze stap geëxtraheerd en een wandelroute tussen deze twee punten gezocht. Het nadeel hiervan is dat de gebruiker nu soms hele lange stukken moet wandelen, maar ik kon (binnen de aangegeven tijd en mijn budget) echt geen andere oplossing vinden. Het voordeel is dat de applicatie nu wel goed werkt en een betrouwbare prijs toont.
* Het combineren van de zeven verschillende databronnen was een flinke uitdaging. Door veel proberen en lange avonden stoeien is het me uiteindelijk gelukt, maar ik zat toen nog steeds met twee complicaties. Ten eerste: door het grote aantal databronnen, is er een bovengemiddeld grote kans dat er iets misgaat tijdens het verzamelen van de data. Denk hierbij bijvoorbeeld aan een API die tijdelijk offline is, of dat de Google Maps API een station anders benoemt dan de NS. Dit is volledig uit mijn handen en ik kan dit dus niet oplossen, maar ik kan er wel voor zorgen dat de applicatie nooit vast zal lopen. Daarom heb ik uitgebreide error handling toegevoegd, zoals ik in de paragraaf "Error handling" beschrijf. De tweede complicatie was dat het verzamelen van al deze data enkele seconden duurt. Omdat Nielsen (1994) stelt dat visuele feedback bij een wachttijd van meer dan 1 seconde al noodzakelijk is, heb ik een laadscherm toegevoegd dat pas verdwijnt zodra alle belangrijke visualisaties geladen zijn.
* Ik kon enkel een TopoJSON-bestand vinden van Nederlandse gemeentes in 2014. Sindsdien is er echter veel veranderd (er zijn vooral veel gemeentes samengevoegd). Ik heb lang gezocht naar een geüpdatete versie, maar uiteindelijk was ik genoodzaakt de nieuwe TopoJSON zelf te maken. Ik heb hiervoor de TopoJSON uit 2014 als basis genomen, opgeheven gemeentes verwijderd en nieuwe gemeentes zelf getekend. Dit was ontzettend veel priegel- en tekenwerk, maar ik heb nu wel een volledig recente kaart in mijn applicatie!
* Het TopoJSON-bestand werkt met gemeente ID's, maar de dataset van de CO2-uitstoot werkt met gemeentenamen. Ik kon deze twee dus niet zomaar combineren. Om dit op te lossen heb ik uiteindelijk zelf een Python-script geschreven dat het CSV-bestand met de ID's, combineert met het CSV-bestand met de namen. Dit script is te vinden in de map `python`.


**Noot: naar mijn mening laat het verslag zoals beschreven op de Mprog-website, veel belangrijke zaken achterwege. Denk hierbij aan de theoretische rechtvaardiging van de designkeuzes en de belangrijke onderdelen van het script. Daarom heb ik dit verslag hieronder uitgebreid met deze aspecten.**


## Theoretische achtergrond
De visualisaties is **Trein of Auto** zijn gebaseerd op uitgebreid literatuuronderzoek. De belangrijkste conclusies vat ik samen in [THEORY.md] (https://github.com/TheLeonKing/Programmeerproject/blob/master/THEORY.md).


## Bekende bugs
Ik heb mijn best gedaan om **Trein of Auto** zo bug-vrij mogelijk te maken. Toch bevat de applicatie nog een drietal bugs, die ik helaas niet op kan lossen:
* De Google Maps Directions API bevat een vreemde bug. Wanneer je 'Schiphol' als eindbestemming opgeeft en kiest voor een OV-route, retourneert de API geen routes, terwijl hij dat op [http://maps.google.com] (http://maps.google.com) wel doet. Als ik 'Schiphol' als beginbestemming instel, retourneert hij wel gewoon routes. Ik heb deze bug reeds gerapporteerd bij Google en het bedrijf heeft me laten weten dat het de fout onderzoekt. In de tussentijd heb ik deze bug afgevangen met een duidelijke foutmelding.
* Google Maps kan geen OV-route bepalen tussen sommige locaties, vooral wanneer deze erg ver van elkaar liggen. Tussen bijvoorbeeld 'Zaandam' en 'Walibi' kan Google Maps geen OV-routes vinden (ook niet op [http://maps.google.com] (http://maps.google.com)). Dit is een tekortkoming in Google Maps en ik kan hier dus niets aan doen. Ik heb deze bug wel gewoon netjes afgevangen, zodat de applicatie in dergelijke gevallen niet vastloopt.
* Sommige tariefeenheden in de NS Prijsmatrix ontbreken. Voor bijvoorbeeld alle reizen van en naar het station 'Buitenpost' zijn geen prijzen gedefinieerd. Na veel zoeken vond ik een oude versie van de prijsmatrix (uit 2014), die voor veel meer stations het aantal tariefeenheden bevat. Echter, omdat deze voor sommige stations iets verouderd is (we praten hier doorgaans over 10 of 20 cent in prijsverschil), geef ik de voorkeur aan het nieuwe bestand. Deze wordt eerst doorzocht. Als daar het aantal tariefeenheden ontbreekt, wordt de oude doorzocht. Als ook die geen aantal tariefeenheden bevat, kan ik echt niks meer doen en toon ik een foutmelding (zodat de applicatie tenminste niet vastloopt).


## Error handling
**Trein of Auto** combineert data van zeven verschillende bronnen. Hoewel ik hard mijn best heb gedaan om deze aansluiting zo naadloos en bug-vrij mogelijk te maken, kan het zijn dat er hierin soms iets fout gaat, bijvoorbeeld als Google Maps een andere stationsbenaming gebruikt dan de NS of als de NS voor een bepaalde reis geen tariefeenheden heeft gedefinieerd.

Ik heb er echter voor gezorgd dat alle fouten die op dit gebied kunnen voorkomen, afgehandeld worden. Steeds wanneer zich een situatie voordoet die mogelijk fout kan gaan, bijvoorbeeld bij het verbinden met een API of combineren van verschillende databronnen, is er een stuk code dat mogelijke fouten afvangt. Ik heb er bovendien voor gezorgd dat de foutmeldingen altijd duidelijk en specifiek zijn, zodat de gebruiker direct begrijpt wat hij kan doen om de fout op te lossen.


## Duidelijk gestructureerde code
**Trein of Auto** combineert data van maar liefst zeven verschillende bronnen. Deze data moet ook verwerkt en opgeschoond worden. Hier heb ik de afgelopen drie weken veel code voor moeten schrijven. Dit heeft ertoe geleid dat de applicatie uiteindelijk bestaat uit ruim 3000 regels code.

Ik heb mijn uiterste best gedaan de code te structuren, om het nakijken ervan zo eenvoudig mogelijk te maken. Enkele maatregelen die ik daarvoor heb getroffen:
* Elke "distinct" taak heeft een eigen functie.
* Wanneer dezelfde code twee keer of vaker herhaald werd, heb ik deze in een losse functie geplaatst. Dit voorkomt de herhaling van code.
* JavaScript ondersteunt helaas geen classes, maar wel [object literals] (http://www.dyn-web.com/tutorials/object-literal/). Hoewel de techniek hierachter verschilt, werkt dit in de praktijk grotendeels hetzelfde. Object literals zijn in mijn code eenvoudig te herkennen, aangezien ze beginnen met een hoofdletter (terwijl functie- en variabelenamen met een kleine letter beginnen). De JavaScript-code van Trein of Auto is gegroepeerd in vijf object literals:
** Car: Alle functies die enkel gebruikt worden voor de autoreis.
** Train: Alle functies die enkel gebruikt worden voor de treinreis.
** Result: Alle algemene functies, die gedeeld worden door de auto- en treinreis.
** GoogleMaps: Alle functies die gebruikmaken van de Google Maps API.
** Visualize: Alle functies die betrekking hebben op een grafiek, kaart of andere visualisatie.


## Deferred
In mijn functies maak ik regelmatig gebruik van JQuery's `$.Deferred()`. De reden hiervoor is simpel: veel van mijn functies halen data op van een externe bron (Google Maps API, RDW API, CSV-bestanden in de `data`-folder, etc.) en het ophalen van deze data vindt plaats op asynchrone wijze. Echter, in veel gevallen hebben latere functies de resultaten van deze asynchrone requests wel nodig.

In dergelijke situaties gebruik ik `$.Deferred()` om te wachten tot de asynchrone actie voltooid is (`.done()`), of een gebruiksvriendelijke foutmelding te tonen als de asynchrone actie mislukte (`.fail()`). Op die manier wordt de rest van de code pas uitgevoerd wanneer alle benodigde variabelen een waarde hebben. Meer informatie over `$.Deferred()` is te vinden op de [officiële JQuery-website] (https://api.jquery.com/category/deferred-object/).


## Valid
Al mijn code is volledig valide volgens de officiële richtlijnen:
* HTML-code gevalideerd met [W3 Markup Validation Service] (https://validator.w3.org/).
* CSS-code gevalideerd met [W3 CSS Validation Service] (https://jigsaw.w3.org/css-validator/validator).
* JS-code gevalideerd met [JavaScript Lint] (http://www.javascriptlint.com/online_lint.php).
** Noot: deze validator geeft bij `visualize.js` ten onrechte de error `unexpected end of line` bij sommige D3-code; dit is een fout in de validator.
* PHP-code gevalideerd met [PHP Code Checker] (http://phpcodechecker.com/).


## Belangrijke terminologie
Ik heb geprobeerd de variabelenamen zo duidelijk mogelijk te maken, zodat er geen domeinkennis nodig is om de code te begrijpen. Toch wil ik graag de term "step" nog even toelichten. Hier wordt vaak over gesproken i.r.t. Google Maps-objecten. Een "step" is één stap van een Google Maps-routebeschrijving. De Google Maps API kan bijvoorbeeld een Directions-object retourneren dat bestaat uit drie steps: "Loop naar Amsterdam Centraal", "Trein naar Amsterdam Science Park", "Loop naar Science Park 402".

Andere termen worden, indien nodig, toegelicht in de code.


## Stappen
Hoewel ik mijn code zo duidelijk mogelijk gestructureerd heb, leek het me verstandig hier nog even kort samen te vatten welke stappen de applicatie doorloopt op de `result.php`-pagina.

<ol>
<li>Haal de benodigde informatie (begin- en eindlocatie, nummerbord, etc.) uit de GET parameters.</li>
<li>Haal de benzineprijzen op uit de MYSQL database.</li>
<li>Zoek een autoroute d.m.v. de Google Maps API.</li>
<li>Valideer de autoroute, i.e. controleer  of deze wel autostukken bevat.</li>
<li>Haal de verbruiksstatistieken van de auto op d.m.v. de RDW API.</li>
<li>Zoek een treinroute d.m.v. de Google Maps API.</li>
<li>Valideer de treinroute, i.e. controleer of deze wel treinstukken bevat.</li>
<li>Zoek wandelalternatieven voor alle niet-trein OV-stukken (bijvoorbeeld met de bus of metro).</li>
<li>Extraheer de begin- en eindstations van de treinroute.</li>
<li>Zoek de afkortingen van deze treinstations op.</li>
<li>Vind het aantal tariefeenheden tussen deze twee treinstations.</li>
<li>Zoek de prijs behorende bij dit aantal tariefeenheden.</li>
<li>Bereken de benzineprijs op basis van het aantal kilometers, het autoverbruik en de benzineprijzen (die we alle drie in eerdere stappen ophaalden).</li>
<li>Bereken de CO2-uitstoot van de autoreis.</li>
<li>Bereken de CO2-uitstoot van de treinreis.</li>
<li>Print de algemene statistieken van de auto- en treinreis (prijs, reisduur, uitstoot) op de DOM.</li>
<li>Print het reisadvies van zowel de auto- als de treinreis op de DOM.</li>
<li>Vind het benzinetype van de auto op basis van de verbruiksgegevens die we eerder verzamelden.</li>
<li>Vind alle benzinestations op de autoroute.</li>
<li>Teken de bar chart die de prijzen van de auto- en treinreis vergelijkt.</li>
<li>Teken de bar chart die de reisduur van de auto- en treinreis vergelijkt.</li>
<li>Teken de bar chart die de prijzen van de verschillende benzinestations vergelijkt.</li>
<li>Teken de bar chart die de CO2-uitstoot van de auto- en treinreis vergelijkt.</li>
<li>Visualiseer het aantal benodigde bomen voor zowel de auto- als de treinreis.</li>
<li>Teken de kaartvisualisatie van de CO2-uitstoot op basis van de CO2-dataset.</li>
<li>Vind de provincies van zowel de begin- als eindlocatie.</li>
<li>Teken de line chart behorende bij de kaartvisualisatie en initialiseer deze met de gemeentes van de begin- en eindlocatie.</li>
<li>Verwijder het laadscherm.</li>
</ol>

Noot: bovenstaande procedure beschrijft alleen de belangrijkste acties die de code uitvoert. Minder invloedrijke acties, zoals het toevoegen van listeners en valideren van ouput verkregen uit de datasets en API's, zijn weggelaten om het stappenplan overzichtelijk te houden.


## Literatuur
* Nielsen, J. (1994). *Usability engineering.* Elsevier.