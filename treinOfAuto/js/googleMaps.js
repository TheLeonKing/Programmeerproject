/*
GOOGLEMAPS.JS
Contains all JS functions that use the Google Maps API.
*/

var carResponse,
	trainResponse,
	carDirectionsRenderer,
	trainDirectionsRenderer;

function initializeMap() {
	var netherlands = new google.maps.LatLng(52.37022, 4.89517);
	var mapOptions = {
		zoom: 7,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: netherlands
	}
	var map = new google.maps.Map(document.getElementById('map'), mapOptions);
	
	carDirectionsRenderer = new google.maps.DirectionsRenderer({
		map: map,
		polylineOptions: {
			strokeColor: '#505050',
			strokeOpacity: 0.8,
			strokeWeight: 6
		}
	});
	
	trainDirectionsRenderer = new google.maps.DirectionsRenderer({
		map: map
	});
}


/* Calculates the car travel route (including distance, travel time, etc.) between two addresses.
   Based on Google's example code: https://developers.google.com/maps/documentation/javascript/directions. */
function carTravel(fromLocation, toLocation) {
	
	var dfd = $.Deferred();
	
	var directionsService = new google.maps.DirectionsService;

	directionsService.route({
		origin: fromLocation,
		destination: toLocation,
		travelMode: google.maps.TravelMode.DRIVING
	}, function(response, status) {
		// If directions were found, return the first available route as an object. Otherwise, show an error.
		if (status === google.maps.DirectionsStatus.OK) {
			carResponse = response;
			dfd.resolve(response.routes[0].legs[0]); // point.duration.text , point.distance.text
		} else {
			dfd.reject('Autoroute kon niet gevonden worden. Foutmelding: ' + status);
		}
	});
	
	return dfd.promise();
}

/* Calculates the train travel route (including distance, travel time, etc.) between two addresses. */
function trainTravel(fromLocation, toLocation) {
	
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
			trainResponse = response;
			google.maps.event.trigger(trainDirectionsRenderer, "resize");
			dfd.resolve(response.routes[0].legs[0]); // point.duration.text , point.distance.text
		} else {
			dfd.reject('Treinroute kon niet gevonden worden. Foutmelding: ' + status);
		}
	});
	
	return dfd.promise();
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