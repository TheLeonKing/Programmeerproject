# Process Book
Leon Kempers, 10626646.

# Dag 1
Maandag 4 januari 2016

## Belangrijke besluiten
* Het belangrijkste besluit van allemaal: wat voor webapplicatie ik ga maken! Ik heb gekozen voor "Trein of Auto" na verschillende alternatieven geëvalueerd te hebben.

## Bereikte mijlpalen
* GitHub repository gecreëerd en voorzien van initiële mappen.
* "Project Proposal" afgemaakt en ingeleverd.
* Grove opzet gemaakt van onderdelen van de applicatie en de technische benodigdheden.
* Benodigde API-sleutel voor NS aangevraagd.

## Complicaties
* Ik ben vandaag nergens tegenaan gelopen.


# Dag 2
Dinsdag 5 januari 2016

## Belangrijke besluiten
* Ik heb ervoor gekozen om zoveel mogelijk te zoeken naar reizen die alleen treinen bevatten. Dit omdat er nog geen goede manier is om de prijzen van busreizen op te halen.

## Bereikte mijlpalen
* Verbinding gemaakt met Google Maps API en verdiept in documentatie.
* JavaScript-code geschreven voor autocomplete "Van"- en "Naar"-velden.
* JavaScript-code geschreven om via Google Maps een routebeschrijving (inclusief afstand + reisduur) tussen twee locaties op te halen, zowel voor auto- als treinreizen.
* Zeer ruwe basis start- en resultatenpagina's.

## Complicaties
* Als de looptocht erg lang wordt, zal Google Maps alsnog kiezen voor een busreis. Hier kan ik echter geen prijzen voor opvragen. Ik weet nog niet hoe ik dit moet oplossen.


# Dag 3
Woensdag 6 januari 2016

## Belangrijke besluiten
* Ik heb ervoor gekozen om me voorlopig enkel te focussen op treinreizen, dus bus- en metroreizen sluit ik uit. De "complicatie" van gisteren is hiermee opgelost.

## Bereikte mijlpalen
* PHP-code geschreven om de recente benzineprijzen op te halen en deze op te slaan in een MYSQL-database.
* Nieuwe bron gevonden voor de verbruiksgegevens van auto's (RDW), die beter aansluit op de Nederlandse situatie.
* JavaScript-code geschreven om de verbruiksgegevens van een bepaalde auto op te halen.
* JavaScript-code geschreven waarmee de prijs van een autorit berekend kan worden.

## Complicaties
* Van sommige auto's zijn geen gebruiksgegevens beschikbaar. Ik moet nog een manier zoeken om hiermee om te gaan.
* Sommige auto's zijn elektrisch. Hoe bereken ik hiervan de kosten?


# Dag 4
Donderdag 7 januari 2016

## Belangrijke besluiten
* Vandaag heb ik vooral mijn eerdere besluiten uitgewerkt. Ik heb dus geen nieuwe besluiten gemaakt.

## Bereikte mijlpalen
* Design Document grotendeels getypt.
* Code geschreven om NS-prijzen te berekenen (hiervoor moesten veel verschillende databronnen gekopieerd worden).
* Betere manier gevonden om met asynchrone functies om te gaan.

## Complicaties
* Er moet heel veel error handling in de applicatie komen (gebruiker vult reis in waarvoor geen treinreis mogelijk is, treinstations worden niet herkend, etc.). Ik moet nog een goede manier verzinnen om dit overzichtelijk te implementeren.


# Dag 5
Vrijdag 8 januari 2016

## Belangrijke besluiten
* Ik heb besloten hoe het design van de webapplicatie er (voorlopig) uitziet.
* Ik heb besloten om de 'detailpagina' te integreren in de resultatenpagina (m.b.v. accordion dropdowns).

## Bereikte mijlpalen
* Design ontworpen.
* Design Document afgemaakt met toevoeging van designschetsen.
* Extra error handling met JavaScript toegevoegd (controleert kentekenplaat vóórdat formulier verstuurd wordt).
* Google Maps-kaart met trein- en autoroutes geïntegreerd.

## Complicaties
* Vandaag zijn geen nieuwe complicaties ontstaan. Een mooi begin van het weekend!