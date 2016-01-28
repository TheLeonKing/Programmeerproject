# Theoretische achtergrond
Leon Kempers, 10626646


## Bar charts
Na veel literatuuronderzoek ben ik tot de conclusie gekomen dat bar charts het beste zijn om de prijs, reisduur en CO2-uitstoot van een auto- en treinreis met elkaar te vergelijken.

Uit onderzoek van Cairo (2012) bleek dat het menselijk brein slecht is in het precies vergelijken van groottes. Een gebruiker kan bijvoorbeeld niet accuraat beoordelen hoeveel keer groter de ene oppervlakte is in verhouding tot de andere. Voor vergelijkingen als prijs en uitstoot is het echter wel van belang dat dit verschil precies kan worden afgelezen. Bubble-visualisaties en pie charts vielen daarom af.

Carpendale (2003) en Cleveland & McGill (1984) stelden dat een bar chart goed geschikt is voor het vergelijken van precieze waardes. Mensen zijn namelijk goed in het nauwkeurig vergelijken van hoogtes, zeker wanneer er ook nog eens assen met numerieke waarden aanwezig zijn. Daarom heb ik ervoor gekozen de prijs, reisduur, benzineprijzen en uitstoot te visualiseren in een bar chart.


## Line chart
Een line chart is een zeer geschikte visualisatiemethode voor zogenaamde "time-series"-data (sets van waarden die mettertijd veranderen; Heer et al., 2010). Een line graph is bovendien zeer handig wanneer je veranderingen over de tijd wilt vergelijken tussen verschillende groepen. Omdat dat precies is wat ik doe in mijn visualisatie (ik vergelijk gemeenten, over een bepaalde tijdsperiode), heb ik hierbij een line chart gebruikt. De Vaus (2013) benadrukt dat de onafhankelijke variabele ordinaal moet zijn bij een line chart en mijn data voldoet aan deze eis.

Met de tooltip voor de line chart heb ik lang geworsteld. Aanvankelijk werd de muiscursor van de gebruiker gevolgd door een verticale lijn, die voor elke gemeente de uitstootwaarde op dat punt in de grafiek toonde. Echter, het probleem hiervan was dat deze tooltip ook geïnterpoleerde waardes tussen datapunten gaf, terwijl dit geen officiële metingen waren.

Ik ben vervolgens uitgebreid op zoek gegaan naar alternatieven, maar deze hadden allemaal één probleem: als ik bij elk datapunt op de huidige x-waarde een tooltip zou tonen, zouden de tooltips over elkaar heen vallen (en dus onleesbaar worden) als de lijnen dicht bij elkaar liggen. Daarom heb ik er uiteindelijk voor gekozen om alle waarden samen te vatten in één tooltip, die wordt getoond op het punt waar de gebruiker zijn muis momenteel houdt. Hierbij heb ik ook gebruikgemaakt van kleuren om het matchen met de lijnen gemakkelijk te maken. Dit is naar mijn mening de beste oplossing: de gebruiker ziet in één oogsopslag alle waarden voor dat specifieke jaar, zonder dat hij op verschillende plekken moet kijken of dat tekst onleesbaar wordt.


## Choropleth
Om de uitstoot per gemeente te visualiseren, heb ik gekozen voor een choropleth. Ik heb hierbij gebruikgemaakt van een sequentiële kleurenschaal, die incrementeel toeneemt in *hue* en *luminance*.

Uit onderzoek van Carpendale (2003) blijkt dat mensen goed zijn in het onderscheiden van kleuren. Hierbij tekent hij wel aan dat dit lastig wordt wanneer er meer dan acht kleuren gebruikt worden. Daarom heb ik ervoor gekozen de uitstootdata onder te verdelen in acht klassen.

Ware (2010) stelde dat verschillende objecten verschillende contrasten moeten hebben om goed van elkaar te onderscheiden te zijn. Zeileis et al. (2009) ondersteunden dit en benadrukten het belang van goed onderscheidbare kleuren. Hier heb ik in al mijn kaartvisualisaties rekening mee gehouden. Bij de Google Maps-visualisaties heb ik er bijvoorbeeld op gelet dat de routelijnen en marker-icoontjes allemaal totaal verschillende kleuren hebben, zodat deze goed van elkaar te onderscheiden zijn. Bij de gemeentevisualisatie heb ik - zoals eerder aangegeven - niet meer dan acht klassen gebruikt om ervoor te zorgen dat de kleuren van elkaar te onderscheiden blijven.

Borland & Taylor (2007) deden onderzoek naar het kleurgebruik bij een sequentiële schaal. Zij ontdekten dat klassekleuren bij een sequentiële schaal incrementeel moeten veranderen in *luminance* en *hue*. De veranderingen moeten dus niet willekeurig zijn. Borland & Taylor raadden aan om perceptueel geordende kleuren te gebruiken wanneer interval- of ratiodata wordt gevisualiseerd. Uit onderzoek van Levkowitz & Herman (1992) bleek tevens dat het veranderen van het contrast een effectieve manier is om sequentiële data te tonen. Zeileis et al. (2009) waren het hiermee eens en beweerden tevens dat de kleuren nog beter te onderscheiden zijn als, naast het contrast, de *hue* verandert. Carpendale (2003), die onderzoek deed naar "visuele variabelen", ondervond dit ook en stelde dat kleurgebruik met een veranderende *hue* goed is voor het tonen van sequentiële verschillen. Dat is waarom ik bij mijn gemeentevisualisatie heb gekozen voor een sequentiële kleurschaal die incrementeel verandert van lichtblauw naar donkerblauw.

Bij mijn gemeentekaart gebruikte ik aanvankelijk klassen die even grote intervallen hadden, maar omdat er een klein aantal hoge outliers in de data zat, viel hierbij het overgrote deel van de data in de laagste klassen. Dit resulteerde in een zeer lichte kaart waarop geen effectieve vergelijkingen mogelijk waren. Ik heb daarom (met behulp van D3) de data onderverdeeld in acht even grote kwantielen en de grenzen van deze kwantielen heb ik uiteindelijk afgerond. Dit resulteert in acht (vrijwel) even grote klassen, die bovendien goed te begrijpen zijn en geen valse indrukken wekken!

Tot slot wilde ik door middel van visuele feedback aangeven welke gemeenten op de kaart momenteel "actief" zijn in de line chart. Het leek me onverstandig om dit te doen door middel van een kleurverandering. De kleur is namelijk precies de waarde-indicator in de kaartvisualisatie, dus als ik die zou veranderen, zou de visualisatie zijn meerwaarde verliezen. Ik heb er uiteindelijk voor gekozen de "actieve" gemeentes te arceren. Dit is op het eerste gezicht niet het duidelijkst, maar wel het correctst en minst misleidend.


## Tufte's designprincipes
Tijdens het ontwerpen van mijn visualisaties heb ik te allen tijde rekening gehouden met Tufte"s designprincipes. Hieronder een korte toelichting.

## Graphical Integrity
Ik heb mijn visualisaties zo ontworpen dat ze niet misleidend zijn. Hierbij heb ik vooral gelet op duidelijk kleurgebruik en duidelijke assen. Dit was niet altijd even makkelijk. De benzineprijzen bijvoorbeeld, die het best getoond kunnen worden in een bar chart (om redenen die ik hierboven beschreef), zouden bijna niet van elkaar te onderscheiden zijn als ik de y-as op 0 zou starten. Echter, zodra de y-as niet start op 0, loop je het risico om gebruikers te misleiden. Om dit te voorkomen, heb ik middels een grote zig-zaglijn duidelijk aangegeven dat de as niet op 0 start.

### Data-Ink ratio
Elke vorm en elke lijn in mijn visualisaties representeert data, of helpt bij het aflezen van de data. Over elke lijn is nagedacht en elke lijn heeft dus een bestaansreden. Bij mijn bar charts heb ik er bijvoorbeeld voor gekozen om wel horizontale *grid lines* te tonen, aangezien deze het aflezen van de bar chart veel eenvoudiger maken, maar geen verticale *grid lines*, omdat dit (bij het vergelijken van twee bars) nutteloos zou zijn.

### Chartjunk
Ik heb mijn best gedaan om chartjunk te allen tijde te voorkomen. Ik heb daarom bijvoorbeeld geen onnodige symbolen of tekeningen toegevoegd aan mijn visualisaties. Mijn visualisaties bestaan enkel uit grafieken en de strikt nodige annotaties bij die grafieken (zoals titels en assenlabels).

### Data density
De visualisaties in **Trein of Auto** bestaan praktisch enkel uit data. Ik heb dus geen onnodige elementen toegevoegd of veel witruimte geïntroduceerd. De enige uitzondering hierop is de gemeentekaart. Die heeft relatief veel witruimte, maar dat kon niet anders vanwege de langwerpige vorm van Nederland.

## Kleurenblindheid
**Trein of Auto** moet voor iedereen toegankelijk zijn. Daarom heb ik constant rekening gehouden met kleurenblinde gebruikers.

Rood-groene kleurenblindheid is de meest voorkomende vorm van kleurenblindheid (Colour Blind Awareness, n.d.). Omdat rood-groen kleurenblinde mensen moeite hebben met het zien van rood en groen, heb ik deze kleuren zoveel mogelijk vermeden in mijn visualisaties. De enige plaats waar ik deze kleuren wel heb gebruikt, is bij de cijfermatige data om de "beste" en "slechtste" optie aan te geven. Zo kunnen niet-kleurenblinden in één oogopslag zien wat de beste optie is, terwijl kleurenblinden nog steeds de cijfers kunnen aflezen.

Mensen die rood-groen kleurenblind zijn, kunnen het best de kleuren blauw en geel waarnemen (Edward Tufte, n.d.). Daarom heb ik de kleur blauw veel gebruikt in mijn visualisaties, onder andere in de bar charts en in de gemeentekaart. Omdat geel lastig te zien is op een witte achtergrond, heb ik als alternatief lichtrood gebruikt. Hoewel rood-groen kleurenblinden meer moeite hebben met het zien van deze kleur, maakt dat in het geval van de bar charts niet uit. In mijn bar charts hoeven kleurenblinden de lichtrode bars namelijk enkel te vergelijken met blauw - een kleur die ze wel kunnen zien. Ze kunnen daardoor dus nog steeds het kleurmatige onderscheid tussen beide balken zien.

Ik heb [Color Brewer] (http://colorbrewer2.org/) en [VisCheck] (http://www.vischeck.com/) gebruikt om mijn kleuren samen te stellen en te controleren. Hieruit bleek dat al mijn visualisaties perfect te begrijpen zijn voor kleurenblinde mensen.


## Literatuur
* Borland, D., & Taylor II, R. M. (2007). Rainbow color map (still) considered harmful. *IEEE computer graphics and applications, (2),* 14-17.
* Cairo, A. (2012). *The Functional Art: An introduction to information graphics and visualization.* New Riders.
* Carpendale, M. S. T. (2003). *Considering visual variables as a basis for information visualisation.*
* Cleveland, W. S., & McGill, R. (1984). Graphical perception: Theory, experimentation, and application to the development of graphical methods. *Journal of the American statistical association, 79(387),* 531-554.
* Heer, J., Bostock, M., & Ogievetsky, V. (2010). A tour through the visualization zoo. *Commun. Acm, 53(6),* 59-67.
* Colour Blind Awareness (jaar onbekend). *What is colour blindness?.* Verkregen op 26 januari, 2016, van http://www.colourblindawareness.org/colour-blindness/.
* Levkowitz, H., & Herman, G. T. (1992). Color scales for image data. *IEEE Computer Graphics and Applications, (1),* 72-80.
* Tufte, E.R. (jaar onbekend). *Choice of colors in print and graphics for color-blind readers.* Verkregen op 26 januari, 2016, van http://www.edwardtufte.com/bboard/q-and-a-fetch-msg?msg_id=0000HT.
* De Vaus, D. (2013). *Surveys in social research.* Routledge.
* Ware, C. (2010). *Visual thinking: For design.* Morgan Kaufmann.
* Zeileis, A., Hornik, K., & Murrell, P. (2009). Escaping RGBland: selecting colors for statistical graphics. *Computational Statistics & Data Analysis, 53(9),* 3259-3270.