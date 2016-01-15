/*
CAR.JS
Contains all JS functions that are unique for the car journey.
*/


/* Fetch the gas usage and CO2 statistics from the user's car. */
function fetchCarStats(customGas, licensePlate) {
	// Create asynchronous logic for return value.
	var dfd = $.Deferred();
	
	var userCar = new Array();
	
	// If user specified custom gas usage stats, use these.
	if (Object.keys(customGas).length > 0) {
		userCar['gasType'] = customGas['gasType'];
		userCar['gasUsage'] = parseFloat(customGas['gasUsage']);
		userCar['co2Emission'] = parseFloat(customGas['emission']);
		dfd.resolve(userCar);		
	}	
	// If these are no custom gas usage stats, fetch the stats from the RDW API.
	else {
		// Start a new XML HTTP Request.
		var xmlhttp = new XMLHttpRequest();
		var url = 'https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=' + licensePlate;

		// Fetch the fuel type and usage from the RDW.
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var responseArray = JSON.parse(xmlhttp.responseText);
				// Sometimes fuel statistics are in first element, sometimes they're in the second. Choose the right one.
				response = (typeof responseArray[0].brandstofverbruik_gecombineerd === 'undefined') ? responseArray[1] : responseArray[0];
				userCar['gasType'] = response.brandstof_omschrijving.toLowerCase();
				userCar['gasUsage'] = parseFloat(response.brandstofverbruik_gecombineerd);
				userCar['co2Emission'] = parseFloat(response.co2_uitstoot_gecombineerd);
				
				// If the fuel type is invalid (e.g. 'Niet geregistreerd' or a faulty value), set it to null.
				if (userCar['gasType'] !== 'benzine' && userCar['gasType'] !== 'diesel' && userCar['gasType'] !== 'lpg') {
					dfd.reject('We konden geen gebruiksgegevens vinden voor dit kenteken. Gelieve deze hieronder zelf op te geven.');
				}
				else {
					dfd.resolve(userCar);
				}
				
			}
		}
		
		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	}
	return dfd.promise();
}


/* Calculate the gas price based on the user's car stats and the gas price.. */
function calculateGasPrice(distance, gasPrice, userCar) {	
	// Fuel usage is per 100 km.
	litersUsed = userCar['gasUsage'] * (distance / 100);
	gasPrice = gasPrice * litersUsed;
	
	return gasPrice.toFixed(2);
}


/* Calculates CO2 emission in grams per kilometer. */
function totalCarEmission(distance, emission) {
	return parseInt(distance * emission);
}


/* Finds the gas type of the user's car and sets the gasArray accordingly. */
function findGasType(type, gasPrices) {
	gasType = type;
	if (gasType == 'benzine') {
		gasType = 'Euro 95'
		gasArray = gasPrices.benzine;
	}
	else if (gasType == 'diesel') {
		gasArray = gasPrices.diesel;
	}
	else if (gasType == 'lpg') {
		gasArray = gasPrices.lpg;
	}
	// Set to 'benzine' by default (to prevent errors).
	else {
		gasType = 'benzine';
		gasArray = gasPrices.benzine;
	}
}


/* Find the cheapest gas station for the user. */
function findBestGasStation(pricesArray) {
	// Find the cheapest gas station for the user's type of gas.
	var cheapest = { price: 99 };
	for(var i in pricesArray) {
		if (parseFloat(pricesArray[i]) < cheapest.price) {
			cheapest = { name: i, price: parseFloat(pricesArray[i]) };
		}
	}
	// Loop over all gas stations we've found (backwards, so we start with the stations)
	// closest to the user) and return the first one of the cheapest company type (e.g. 'BP').
	for (var i = gasStations.length-1; i >= 0; --i) {
		stationName = (gasStations[i]['name']).toLowerCase();
		if ((stationName).indexOf(cheapest.name) >= 0) {
			lat = gasStations[i].geometry.location.lat();
			lng = gasStations[i].geometry.location.lng();
			// Display gas station details on DOM. Include Google Maps API Street View image.
			$('#cheapestStation .image').html('<img src="http://maps.googleapis.com/maps/api/streetview?size=290x217&location=' + lat + ',' + lng + '&fov=120&pitch=10&sensor=false" />');
			$('#cheapestStation .header').html('Goedkoopst: ' + gasStations[i]['name']);
			$('#cheapestStation .description').html(gasStations[i]['vicinity']);
			$('#cheapestStation .price').html('Prijs: ' + (cheapest.price).toString().replace('.', ',') + ' euro per liter');
			return;
		}
	}
	
	// If the function didn't return yet, the cheapest gas station is not on the user's route. Remove this
	// station from the gasArray and recursively call this function to find the next cheapest gas station.
	if (Object.keys(pricesArray).length > 1) {
		delete pricesArray[cheapest.name];
		findBestGasStation(pricesArray);
	}
	// If we checked the last gas station and it's not on the route either, display an error.
	else {
		$('#cheapestStation .image').html('<img src="images/noresults.png" />');
		$('#cheapestStation .header').html('Niets gevonden');
		$('#cheapestStation .description').html('We konden geen van de vijf benzinestations vinden op jouw route.');
		$('#cheapestStation .price').html('Geen prijs');
	}
	
}