/*
GOOGLEMAPS.JS
Contains all JS functions that use the Google Maps API.
*/

var carResponse,
	trainResponse,
	carDirectionsRenderer,
	trainDirectionsRenderer,
	placesService,
	routeBoxer,
	routeMap,
	gasMap,
	infoWindow,
	boxes,
	gasStations = [];

/* Initialize the Google Maps map. */
function initializeMap() {
	// Initialize map to center on The Netherlands.
	var netherlands = new google.maps.LatLng(52.37022, 4.89517);
	var mapOptions = {
		zoom: 7,
		mapTypeId: google.maps.MapTypeId.ROADMAP,
		center: netherlands
	}
	
	// Create a new info window for the tooltips.
	infoWindow = new google.maps.InfoWindow();
	
	// Create a new RouteBoxer and maps.
	routeBoxer = new RouteBoxer();
	routeMap = new google.maps.Map(document.getElementById('routeMap'), mapOptions);
	gasMap = new google.maps.Map(document.getElementById('gasMap'), mapOptions);
	
	// Set up the renderers and services needed for the car journey, train journey and places.
	carDirectionsRenderer = new google.maps.DirectionsRenderer({
		map: routeMap,
		polylineOptions: {
			strokeColor: '#ef8a62',
			strokeOpacity: 0.8,
			strokeWeight: 6
		}
	});
	
	trainDirectionsRenderer = new google.maps.DirectionsRenderer({
		map: routeMap
	});
	
	carDirectionsRendererGas = new google.maps.DirectionsRenderer({
		map: gasMap,
		polylineOptions: {
			strokeColor: '#ef8a62',
			strokeOpacity: 0.8,
			strokeWeight: 6
		}
	});
	
	placesService = new google.maps.places.PlacesService(routeMap);
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
			// Resolve the route we've found.
			carResponse = response;
			dfd.resolve(response.routes[0].legs[0]);
			
			// Use RouteBoxer to create boxes around 0.5 km of the route.
			var path = response.routes[0].overview_path;
			boxes = routeBoxer.box(path, 0.5);
			
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
			dfd.resolve(response.routes[0].legs[0]); // point.duration.text , point.distance.text
		} else {
			dfd.reject('Treinroute kon niet gevonden worden. Foutmelding: ' + status);
		}
	});
	
	return dfd.promise();
}


/* Find all gas stations on the route. */
function findGasStations(boxes, counter) {
	// Search for gas stations in the bounds of the current box.
	placesService.nearbySearch({
		bounds: boxes[counter],
		types: ['gas_station']
		}, function(results, status) {
			// If one or more gas stations were found, add these to the map.
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					addMarker(results[i], 'gas', gasMap);
				}
			}
		}
	);
	
	// If there are still boxes left, explore them.
	counter++;
	if (counter < boxes.length)  {
		// Wait 0,25 seconds between every API request, otherwise we'll get only a part of all stations.
		setTimeout(function() { findGasStations(boxes,counter) }, 250);
	}
	else {
		findBestGasStation(gasArray);
	}
}


/* Finds all parking spots around the user's destination. */
function findParkingSpots() {
	// Extract destination latitude and longitude from the 'journey' object.
	var destination = {lat: journey.car.end.lat, lng: journey.car.end.lng };
	
	// Center map on destination.
	routeMap.setCenter(destination);
	routeMap.setZoom(15);

	// Use the Google Maps API to find nearby parking spots.
	placesService.nearbySearch({
		location: destination,
		radius: 500,
		types: ['parking']
		}, function(results, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					addMarker(results[i], 'parking', routeMap);
				}
			} else {
				window.alert('Helaas! We konden geen parkeerplaatsen vinden in de buurt van jouw bestemming.');
			}
		}
	);
}


/* Adds a parking spot marker (with an info window) to the map. */
function addMarker(place, type, map) {
	
	gasStations.push(place);
	
	// Based on Google's API documentation: https://developers.google.com/maps/documentation/javascript/examples/place-details.
	var placeLoc = place.geometry.location;
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location,
		icon: 'images/markers/' + type + '.png'
	});
	
	// Add a listener to open the info window when the user clicks on the marker.
	google.maps.event.addListener(marker, 'click', function() {
		infoWindow.setContent('<div><strong>' + place.name + '</strong><br>' + place.vicinity);
		infoWindow.open(map, this);
	});
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