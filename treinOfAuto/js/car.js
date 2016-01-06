/*
CAR.JS
Contains all JS functions that are unique for the car journey.
*/


/* Fetch the gas usage statistics from the user's car. */
function findCarPrice(licensePlate, carJourney, gasPrices) {
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
			userCar['gasType'] = responseArray[0].brandstof_omschrijving.toLowerCase();
			userCar['gasUsage'] = parseFloat(responseArray[0].brandstofverbruik_gecombineerd);
		
			// If the fuel type is invalid (e.g. 'Niet geregistreerd' or a random number), set it to null.
			// TODO: WAT TE DOEN MET ELEKTRICITEIT?
			// TODO: CREATE USER INPUTS FOR 'NULL' CASES.
			if (userCar['gasType'] !== 'benzine' && userCar['gasType'] !== 'diesel' && userCar['gasType'] !== 'lpg') {
				userCar['gasType'] = null;
				window.alert("ERROR: NO USAGE STATISTICS FOUND.");
				window.stop()
			}
			
			gasPrice = calculateGasPrice(licensePlate, carJourney, gasPrices, userCar)
			dfd.resolve(gasPrice);
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
	
	return gasPrice;
}