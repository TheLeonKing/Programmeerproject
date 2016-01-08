/*
CAR.JS
Contains all JS functions that are unique for the car journey.
*/


/* Fetch the gas usage and CO2 statistics from the user's car. */
function fetchCarStats(licensePlate) {
	// Create asynchronous logic for return value.
	var dfd = $.Deferred();
	
	var userCar = new Array();
	
	// Start a new XML HTTP Request.
	var xmlhttp = new XMLHttpRequest();
	var url = 'https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=' + licensePlate;

	// Fetch the fuel type and usage from the RDW.
	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
			var responseArray = JSON.parse(xmlhttp.responseText);
			// Sometimes fuel statistics are in first element, sometimes they're in the second. Choose the right one.
			response = (typeof responseArray[0].brandstof_omschrijving === 'undefined') ? responseArray[1] : responseArray[0];
			userCar['gasType'] = response.brandstof_omschrijving.toLowerCase();
			userCar['gasUsage'] = parseFloat(response.brandstofverbruik_gecombineerd);
			userCar['co2Emission'] = parseFloat(response.co2_uitstoot_gecombineerd);
			
			// If the fuel type is invalid (e.g. 'Niet geregistreerd' or a faulty value), set it to null.
			if (userCar['gasType'] !== 'benzine' && userCar['gasType'] !== 'diesel' && userCar['gasType'] !== 'lpg') {
				userCar['gasType'] = null;
				dfd.reject("Couldn't find usage statistics for this car.");
			}
			else {
				dfd.resolve(userCar);
			}
			
		}
	}
	
	xmlhttp.open('GET', url, true);
	xmlhttp.send();
	return dfd.promise();
}


/* Calculate the gas price based on the user's car stats and the gas price.. */
function calculateGasPrice(licensePlate, carJourney, gasPrices, userCar) {
	
	// Get journey distance (in meters) and convert it to kilometers.
	travelDistance = carJourney.distance.value / 1000;
	
	// Fuel usage is per 100 km.
	litersUsed = userCar['gasUsage'] * (travelDistance / 100);
	gasPrice = gasPrices[userCar['gasType']]['average'] * litersUsed;
	
	return gasPrice.toFixed(2);
}


/* Calculates CO2 emission in grams per kilometer. */
function totalCarEmission(distance, emission) {
	return parseInt(distance * emission);
}