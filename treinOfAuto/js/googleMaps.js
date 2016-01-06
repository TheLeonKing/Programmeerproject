/*
GOOGLEMAPS.JS
Contains all JS functions that use the Google Maps API.
*/


/* Calculates travel routes + statistics for both car and train. */
function travel(fromLocation, toLocation, licensePlate, gasPrices) {
	// Wait until car and train travel times have been calculated.
	carTravel(fromLocation, toLocation).done(function(carJourney) {
		trainTravel(fromLocation, toLocation).done(function(trainJourney) {
			
			// If car and train are both equally fast.
			if (carJourney.duration.value == trainJourney.duration.value) {
				window.alert("EVEN LANG!");
			}
			// If train is faster.
			else if (carJourney.duration.value > trainJourney.duration.value) {
				window.alert("TREIN SNELLER!");
			}
			// If car is faster.
			else {
				window.alert("AUTO SNELLER!");
			}
			
					
			$("#log").html("Reisduur auto: " + carJourney.duration.text + ". Reisduur trein: " + trainJourney.duration.text)
			
			// Extract the beginning and end station from the train route.
			findTrainStations(trainJourney.steps, fromLocation); // trainRoute.from, trainRoute.to
			
			// Calculate the prices of the car and train journey.
			//console.log(calculateCarPrice('73PLVZ', carJourney, gasPrices));
			findCarPrice(licensePlate, carJourney, gasPrices).done(function(carPrice) {
				console.log(carPrice);
			});
		});
	});
	
}

/* Calculates the car travel route (including distance, travel time, etc.) between two addresses.
   Based on Google's example code: https://developers.google.com/maps/documentation/javascript/directions. */
function carTravel(fromLocation, toLocation) {
	// Create asynchronous logic for return value.
	var dfd = $.Deferred();
	
	var directionsService = new google.maps.DirectionsService;

	directionsService.route({
		origin: fromLocation,
		destination: toLocation,
		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
		// If directions were found, return the first available route as an object. Otherwise, show an error.
		if (status === google.maps.DirectionsStatus.OK) {
			dfd.resolve(response.routes[0].legs[0]); // point.duration.text , point.distance.text
		} else {
			window.alert('Er kon helaas geen autoroute gevonden worden. Neem a.u.b. contact met ons op en attendeer ons op de volgende foutmelding: ' + status);
		}
	});
	
	return dfd.promise();
}

/* Calculates the train travel route (including distance, travel time, etc.) between two addresses. */
function trainTravel(fromLocation, toLocation) {
	// Create asynchronous logic for return value.
	var dfd = $.Deferred();
	
	var directionsService = new google.maps.DirectionsService;

	directionsService.route({
		origin: fromLocation,
		destination: toLocation,
		travelMode: google.maps.TravelMode.TRANSIT,
		transitOptions: { modes: [google.maps.TransitMode.TRAIN] } // Only find train routes.
	}, function(response, status) {
		// If directions were found, return the first available route as an object. Otherwise, show an error.
		if (status === google.maps.DirectionsStatus.OK) {
			dfd.resolve(response.routes[0].legs[0]); // point.duration.text , point.distance.text
		} else {
			window.alert('Er kon helaas geen treinroute gevonden worden. Neem a.u.b. contact met ons op en attendeer ons op de volgende foutmelding: ' + status);
		}
	});
	
	return dfd.promise();
}

/* Extracts the beginning and the end train stations from a steps object. */
function findTrainStations(steps, fromLocation) {
	// Create new array with just the instructions that start with "Trein".
	var stepsFiltered = steps.filter(
		function (v, i) { v.index = i; return (v.instructions).match('^Trein') }
	);
	
	// If the first step starts at a train station, extract the train station name from the "from" field.
	firstTransitIndex = stepsFiltered[0]['index'];
	if (firstTransitIndex == 0) {
		// Extract part before first comma, e.g. "Amsterdam Centraal, Stationsplein, Amsterdam, Netherlands" to "Amsterdam Centraal".
		fromStation = fromLocation.substr(0, fromLocation.indexOf(','));
	}
	// If the first train step isn't the first step, extract the train station name from the previous step.
	else {
		// Extract part after "naar", e.g. "Loop naar Amsterdam Centraal" to "Amsterdam Centraal".
		instruction = steps[firstTransitIndex-1]['instructions'];
		fromStation = instruction.split('naar')[1];
	}
	
	// Extract the end station from the final transit instruction, e.g. "Trein naar Heerlen" to "Heerlen".
	toStation = $(stepsFiltered).get(-1)['instructions'].split('naar')[1];
	
	return {'from': fromStation, 'to': toStation};
	
	
}


/* Initializes address bar with auto-complete from Google Maps API. */
function addressBar(inputId) {
	
	// Set up the Google Maps auto-complete API.
	var fromInput = document.getElementById(inputId);
	var options = {componentRestrictions: {country: 'nl'}};
	var autocomplete = new google.maps.places.Autocomplete(fromInput, options);
	
	// Auto-complete input with first suggestion when user presses enter button.
	google.maps.event.addDomListener(fromInput,'keydown',function(e){
		if(e.keyCode == 13 && !e.triggered){ 
			google.maps.event.trigger(this,'keydown',{keyCode:40}) 
			google.maps.event.trigger(this,'keydown',{keyCode:13,triggered:true}) 
		}
	});
};