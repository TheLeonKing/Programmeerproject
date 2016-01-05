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

function travelTime(fromLocation, toLocation) {
	// Wait until car and train travel times have been calculated.
	carTravelTime(fromLocation, toLocation).done(function(car) {
		trainTravelTime(fromLocation, toLocation).done(function(train) {
			console.log(car);
		});
	});
	
}

// Calculates the car travel distance between two addresses.
// Based on Google's example code: https://developers.google.com/maps/documentation/javascript/directions.
function carTravelTime(fromLocation, toLocation) {
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

// Calculates the train travel distance between two addresses.
function trainTravelTime(fromLocation, toLocation) {
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