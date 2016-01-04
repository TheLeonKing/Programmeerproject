# Trein of auto (treinofauto.nl)
Leon Kempers, 10626646 (Data Processing).

## Probleemdefinitie
We kennen het allemaal: met half dichtgeknepen oogjes kruip je 's ochtends uit je bed en wanneer je de gordijnen opentrekt, zie je dat Nederland bedekt is met een dik pak sneeuw. Je krijgt direct een vervelend gevoel in je onderbuik en wanneer je de tv aanzet, wordt je angst bevestigd: het is een chaos op de weg en het spoor. Je hebt echter een belangrijke afspraak en moet zo snel mogelijk in Maastricht zijn. Waar kies je voor: de auto of de trein?

Of misschien heb je wel een dure maand gehad. Na de kerstcadeautjes voor je familie en die wintervoorraad drank met oudjaar, is je geld wel even op. Waar kies je voor als budgetbewuste reiziger: de auto of de trein?

De webapplicatie "Auto of trein" is bedoeld om antwoord te geven op dergelijke vragen. Je geeft je beginlocatie en eindbestemming op en op basis van de huidige benzineprijzen en NS-gegevens berekent de applicatie automatisch wat goedkoper en/of sneller is: de auto of de trein.

## Schets
Bla.

## Benodigde datasets
Benodigde API's:
* <a href="http://www.ns.nl/reisinformatie/ns-api" target="_blank">NS API</a>: Om de prijs en duur van de treinreis op te halen.
* <a href="https://developers.google.com/maps/" target="_blank">Google Maps API</a>: Om de afstand en duur van de autoroute op te halen.

Benodigde datasets:
* <a href="https://www.fueleconomy.gov/feg/download.shtml" target="_blank">Fuel Economy Data</a>: Officiële verzameling datasets van de Amerikaanse overheid. Toont van vrijwel elk voertuig in de wereld het brandstofverbruik in "miles per gallon" (kan omgerekend worden naar "liter per 100 km") en het type benzine. Ik zal de verschillende datasets (ze zijn gescheden per jaar) combineren en uitlezen met PHP.
* <a href="https://www.unitedconsumers.com/tanken/informatie/brandstof-prijzen.asp" target="_blank">United Consumers: Actuele brandstofprijzen</a>: Helaas is er voor Nederland geen dataset of API waarmee de huidige brandstofprijs opgehaald kan worden. Daarom ben ik genoodzaakt deze prijs te crawlen van een webpagina. Voor mijn applicatie gebruik ik de pagina van United Consumers, omdat die de meest uitgebreide informatie toont (namelijk ook de prijzen per benzinestation).


## Delen van de applicatie
De applicatie bestaat uit drie delen:
* Het beginscherm, waarin de gebruiker zijn beginbestemming en eindlocatie kan opgeven.
* Het resultatenscherm, waarin in één oogopslag te zien is welke optie het goedkoopst is en welke optie het snelst is.
* Het detailscherm, met daarin visualisaties van de reisduur, de prijs en eventueel de route.


## Platform en API's
Ik verwacht dat ik het grootste deel van de applicatie zal schrijven in PHP, al heb ik ook HTML en CSS nodig voor de website. De visualisaties wil ik implementeren met D3, dus daarvoor heb ik Javascript nodig. Zoals hierboven beschreven zal ik de NS API en de Google Maps API gebruiken.


## Potentiële problemen
Ik voorzie momenteel twee potentiële problemen:
* Het gebruik van de NS API. Ik heb nog nooit gewerkt met een API als deze, dus hier zal ik veel uitzoekwerk voor moeten uitvoeren.
* Het ophalen van de brandstofgegevens per auto en deze combineren met de brandstofprijzen. In de dataset van de Amerikaanse overheid staan duizenden auto's en van al deze auto's is ontzettend veel informatie opgeslagen. Ik zal deze dataset dus flink moeten opschonen en het wordt waarschijnlijk ook een uitdaging om deze gegevens te combineren met de real-time brandstofprijzen. Echter, als ik blijf proberen en indien nodig hulp vraag, verwacht ik dat ik er wel uit moet komen.

## Gelijksoortige applicaties
Er is momenteel geen website zoals "Auto of trein", al worden de twee onderdelen waar de applicatie in feite uit bestaat, wel los aangeboden:
* [NS.nl] <http://www.ns.nl/>: Geeft de prijs en duur van een treinreis. Hier wordt cijfermatige data gegeven, maar er zijn geen visualisaties aanwezig.
* [Benzinekosten-berekenen.nl] (http://benzinekosten-berekenen.nl/): Staat je toe om de benzinekosten van je reis te berekenen. Ook hier geldt dat er geen visualisaties zijn; alle data is in de vorm van cijfers.
Door deze twee applicaties als het ware te "combineren" ontstaat er echter totaal nieuwe informatie. Nu kan de vraag "Wat is goedkoper: de auto of de trein?" namelijk snel en eenvoudig beantwoord worden! Bovendien zal "Auto of trein" je toestaan om je autotype in te geven, waarna de verbruiksgegevens automatisch op worden gehaald. Bij Benzinekosten-berekenen moet je zelf het verbruik opzoeken en ingeven.


