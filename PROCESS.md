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


# Dag 6
Maandag 11 januari 2016

## Belangrijke besluiten
* Geen.

## Bereikte mijlpalen
* Visualisaties voor prijs, duur en benzinestations (nog niet helemaal af) gemaakt.
* Verschillende bugs in de code van vorige week gefixt.

## Complicaties
* Het maken van de visualisaties kostte meer tijd dan verwacht, maar nu heb ik het redelijk door.


# Dag 7
Dinsdag 12 januari 2016

## Belangrijke besluiten
* Ik heb besloten om ook de instructies van het reisadvies toe te voegen.

## Bereikte mijlpalen
* Visualisatie van benzinestations afgemaakt.
* Visualisatie van CO2-uitstoot toegevoegd.
* Instructies van reisadvies opgehaald, verwerkt en toegevoegd.

## Complicaties
* Het ging vandaag ontzettend lekker, geen complicaties!


# Dag 8
Woensdag 13 januari 2016

## Belangrijke besluiten
* Ik heb besloten om meer de focus te leggen op het milieu, om zo een storytelling-aspect toe te voegen.

## Bereikte mijlpalen
* Instructies voor auto- en treinreis toegevoegd.
* 'Aantal bomen'-visualisatie toegevoegd.

## Complicaties
* Nieuwe bug ontdekt bij het plannen van reizen naar bepaalde locaties; hier moet ik nog naar kijken.


# Dag 9
Donderdag 14 januari 2016

## Belangrijke besluiten
* Ik heb besloten om meer de focus te leggen op het plannen van een autoreis.

## Bereikte mijlpalen
* Parkeerplaatsen rond bestemming toegevoegd.
* Benzinestations op route toegevoegd en dit verbonden met de laagste prijs.

## Complicaties
* Ik kan (nog) geen interessante invalshoeken vinden voor het storytelling-aspect.


# Dag 10
Vrijdag 15 januari 2016

## Belangrijke besluiten
* Ik heb besloten om de benzineprijzen in de grafiek niet per liter, maar voor de gehele prijs weer te geven.

## Bereikte mijlpalen
* De mogelijkheid toegevoegd om zelf de verbruiksgegevens van je auto op te vragen.
* Veel mogelijke fouten opgevangen met foutmeldingen.

## Complicaties
* Vandaag heb ik vooral complicaties opgelost en dat is ook weleens fijn.


# Dag 11
Maandag 18 januari 2016

## Belangrijke besluiten
* Ik heb besloten om wandelalternatieven te zoeken voor alle stukken met de bus/metro/tram.

## Bereikte mijlpalen
* Visualisatie zoekt nu wandel-alternatief voor elk stukje van de route dat wel OV, maar niet auto is (e.g. een stuk met de bus). Je weet nu dus zeker dat de treinreis enkel uit wandel- en treinstappen bestaat! Dit kostte me ontzettend veel tijd en ik ben er de hele dag mee bezig geweest.

## Complicaties
* Geen; vandaag heb ik zo'n beetje de grootste complicatie (dat er soms toch nog bus-stukken in de route terecht kwamen) juist verholpen!


# Dag 12
Dinsdag 19 januari 2016

## Belangrijke besluiten
* Ik heb besloten om een grafiek met uitstoot per gemeente toe te voegen.

## Bereikte mijlpalen
* Enkele bugs van gisteren gefixt.
* Begin gemaakt aan de grafiek van 'uitstoot per gemeente'; was veel meer werk dan gedacht!

## Complicaties
* De grafiek is meer werk dan gedacht; hopelijk krijg ik alles op tijd af.


# Dag 13
Woensdag 20 januari 2016

## Belangrijke besluiten
* Ik heb besloten om de uitstoot per gemeente ook op een kaart te visualiseren.

## Bereikte mijlpalen
* Heel veel. Ik heb vandaag ontzettend lang gewerkt, maar ook grote stappen gezet.
* Kaart met uitstoot per gemeente toegevoegd. Dit was erg veel werk, vooral omdat de meest recente TopoJSON-gemeentekaart van Nederland die ik kon vinden, stamde uit 2014. Inmiddels zijn veel gemeenten veranderd en deze moest ik er dus allemaal zelf opnieuw intekenen.
* Python-script geschreven om bestand met gemeente ID's en bestand met uitstoot per gemeente met elkaar te verbinden.
* Kaart verbonden met grafiek.
* Grafiek verder geoptimaliseerd.
* Zig-zaglijn toegevoegd aan grafiek benzineprijzen.

## Complicaties
* De kaartvisualisatie me een jaar van mijn leven heeft gekost (wat een frustraties...), maar verder waren er vandaag geen complicaties.


# Dag 14
Donderdag 21 januari 2016

## Belangrijke besluiten
* Geen.

## Bereikte mijlpalen
* Kaartvisualisatie afgemaakt.
* Tooltips geïmplementeerd in kaartvisualisatie en uitstootgrafiek.
* Laadscherm toegevoegd.
* Menu werkende gemaakt.

## Complicaties
* Vandaag was een complicatieloze dag!


# Dag 15
Vrijdag 22 januari 2016

## Belangrijke besluiten
* Vandaag heb ik de beta-versie afgerond en dus besloten hoe de (vrijwel) definitieve versie van mijn applicatie eruit ziet!

## Bereikte mijlpalen
* Code veel beter gestructureerd (o.a. d.m.v. object literals).
* Code opgeschoond (ongebruikte functies verwijderd, placeholders vervangen, etc.).
* Bugs met Google Maps API en visualisaties gelost.

## Complicaties
* Ik kwam er vandaag achter dat de prijsmatrix van de NS niet voor ieder station compleet is. Dat kan ik zelf niet oplossen, helaas.