/*
GOOGLEMAPS.JS
Contains all JS functions that use the Google Maps API.
*/


var carResponse,
	trainResponse,
	directionsService,
	carDirectionsRenderer,
	trainDirectionsRenderer,
	placesService,
	routeBoxer,
	routeMap,
	gasMap,
	infoWindow,
	boxes,
	gasStations = [];


var GoogleMaps = {	

	/* Initialize the Google Maps maps, renderers and services. */
	initializeMap: function() {
		
		// Initialize map to center on The Netherlands.
		var netherlands = new google.maps.LatLng(52.37022, 4.89517);
		var mapOptions = {
			zoom: 7,
			mapTypeId: google.maps.MapTypeId.ROADMAP,
			center: netherlands
		};
		
		// Create a new info window for the tooltips.
		infoWindow = new google.maps.InfoWindow();
		
		// Create a new RouteBoxer and create new maps.
		routeBoxer = new RouteBoxer();
		routeMap = new google.maps.Map(document.getElementById('routeMap'), mapOptions);
		gasMap = new google.maps.Map(document.getElementById('gasMap'), mapOptions);
		
		// Set up the renderers and services needed for the car journey, train journey and places.
		directionsService = new google.maps.DirectionsService();
		
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
	},


	/* Calculates the car travel route (including distance, travel time, etc.) between two addresses.
	   Based on Google's example code: https://developers.google.com/maps/documentation/javascript/directions. */
	carRoute: function(fromLocation, toLocation) {
		
		var dfd = $.Deferred();

		// Create a new route request with travel mode 'driving'.
		directionsService.route({
			origin: fromLocation,
			destination: toLocation,
			travelMode: google.maps.TravelMode.DRIVING
		}, function(response, status) {
			// If directions were found, return the first available route as an object. Otherwise, show an error.
			if (status === google.maps.DirectionsStatus.OK) {
				// Resolve the route we've found.
				carResponse = response;
				carJourney = response.routes[0].legs[0];
				
				// Check if journey is valid (i.e. contains car travel).
				var valid = Result.isValid(carJourney.steps, 'DRIVING');
				
				// If journey doesn't contain car travel, show error. Otherwise, return journey object.
				if (valid === false) {
					dfd.reject('We konden geen autoroute vinden voor deze reis. Waarschijnlijk liggen de locaties te dicht bij elkaar.');		
				} else {			
					dfd.resolve(carJourney);
				
					// Use RouteBoxer to create boxes around 0.5 km of the route.
					var path = response.routes[0].overview_path;
					boxes = routeBoxer.box(path, 0.5);
				}
			
			// If Google Maps didn't return any routes (very unlikely for a car journey, but better safe than sorry).
			} else {
				dfd.reject('We konden geen autoroute vinden voor deze reis. Wijzig uw begin- en/of eindlocatie.');
			}
		});
		
		return dfd.promise();
	},



	/* Calculates the train travel route (including distance, travel time, etc.) between two addresses. */
	trainRoute: function(fromLocation, toLocation) {
		
		var dfd = $.Deferred();

		// Create a new route request with travel mode 'transit', and stress that Google should focus on train routes.
		directionsService.route({
			origin: fromLocation,
			destination: toLocation,
			travelMode: google.maps.TravelMode.TRANSIT,
			transitOptions: { modes: [google.maps.TransitMode.TRAIN] }
		}, function(response, status) {
			// If directions were found, return the first available route as an object. Otherwise, show an error.
			if (status === google.maps.DirectionsStatus.OK) {
				trainResponse = response;
				trainJourney = response.routes[0].legs[0];
				dfd.resolve(trainJourney);
			
			// If Google Maps didn't return transit routes, shown an error stating this (error handling).
			} else {
				dfd.reject('We konden geen treinroute vinden voor deze reis. Waarschijnlijk liggen de locaties te dicht bij (of ver van) elkaar.');
			}
		});
		
		return dfd.promise();
	},


	/* Recursively loops through all trainJourney steps and finds walking alternatives
	   for all transit, non-train steps (e.g. walking alternative for bus journey). */
	trainOnly: function trainOnly(trainJourney, dfd) {
		
		var steps = trainJourney.steps;
		
		var subtract = { distance: 0, duration: 0 };
		var add = { distance: 0, duration: 0 };
		
		// Credits to http://stackoverflow.com/questions/4288759/asynchronous-for-cycle-in-javascript
		// for the 'asyncLoop' function.
		var asyncLoop = function(o) {
			var i =- 1;

			var loop = function() {
				i++;
				if (i==o.length) {
					o.callback();
					return;
				}
				o.functionToLoop(loop, i);
			};
			loop();
		};
		
		asyncLoop({
			length : steps.length,
			// Loop through all journey steps.
			functionToLoop : function(loop, i) {
				
				// If this step is a transit step that doesn't involve a train, find a walking route from
				// the beginning location of the step to the end location of the step.
				if (steps[i].travel_mode === 'TRANSIT' && (steps[i].instructions).match('^Trein') === null) {
					// Subtract the distance and duration from the step we're about to remove.
					subtract.distance += steps[i].distance.value;
					subtract.duration += steps[i].duration.value;
					
					// Find the 'from' and 'to' location from the step.
					var fromLocation = steps[i].start_location.lat() + ',' + steps[i].start_location.lng();
					var toLocation = steps[i].end_location.lat() + ',' + steps[i].end_location.lng();
					
					// Find a walking route alternative between 'fromLocation' and 'toLocation'.
					directionsService.route({
						origin: fromLocation,
						destination: toLocation,
						travelMode: google.maps.TravelMode.WALKING
					}, function(response, status) {
						// If directions were found, return the first available walking route as an object.
						if (status === google.maps.DirectionsStatus.OK) {
							var walkJourney = response.routes[0].legs[0];
							
							// Add the distance and duration of this walking route.
							add.distance += walkJourney.distance.value;
							add.duration += walkJourney.duration.value;
							
							// Update the trainJourney distance and value.
							trainJourney.distance.value = trainJourney.distance.value - subtract.distance + add.distance;
							trainJourney.duration.value = trainJourney.duration.value - subtract.duration + add.duration;
							
							// Remove the non-train step and put the walking journey steps at its index position.
							(trainJourney.steps).splice(i, 1, walkJourney.steps);
							
							// Flatten the steps array and update the trainResponse with the new trainJourney we've just created.
							trainJourney.steps = $.map(trainJourney.steps, function(n){ return n; });
							trainResponse.routes[0].legs[0] = trainJourney;
							
							// Call the function again (we can't just continue because the 'steps' length won't be correct anymore).
							trainOnly(trainJourney, dfd);
						}
						// If we couldn't find a walking journey, just continue and don't remove the non-train step (this will
						// probably never happen, since walking journeys are possible almost everywhere throughout The Netherlands).
						else {
							loop();
						}
					});
				}
				// If this a step we do 'allow', continue looping.
				else {
					loop();
				}
				
			},
			// If we've looped through all steps and they're all 'allowed'.
			callback : function(){
				
				// Update the duration (as text) using the duration (as an integer in seconds).
				var durationSeconds = trainResponse.routes[0].legs[0].duration.value;
				
				// Only include hours if duration is more than an hour (so we get e.g. '48 min.' instead of '0 uur 48 min.').
				if (durationSeconds < 3600) {
					trainResponse.routes[0].legs[0].duration.text = moment().startOf('day').seconds(durationSeconds).format('m [min.]');				
				} else {
					trainResponse.routes[0].legs[0].duration.text = moment().startOf('day').seconds(durationSeconds).format('H [uur] m [min.]');				
				}
				
				newTrainJourney = trainResponse.routes[0].legs[0];
				
				// Check if journey contains train travel.
				var valid = Result.isValid(newTrainJourney.steps, 'TRANSIT');
				
				// If journey contains train travel, return journey object. Otherwise, show error.
				if (valid) {
					dfd.resolve(newTrainJourney);
				} else {
					dfd.reject('We konden geen treinroute vinden voor deze reis. Waarschijnlijk liggen de locaties te dicht bij (of ver van) elkaar.');		
				}
			}
		});
		
		return dfd.promise();
	},



	/* Find all gas stations on the route. */
	findGasStations: function findGasStations(boxes, counter) {
		
		// Search for gas stations in the bounds of the current RouteBox.
		placesService.nearbySearch({
			bounds: boxes[counter],
			types: ['gas_station']
			}, function(results, status) {
				// If one or more gas stations were found, add these to the map.
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					for (var i = 0; i < results.length; i++) {
						GoogleMaps.addMarker(results[i], 'gas', gasMap);
					}
				}
			}
		);
		
		// If there are still boxes left, explore them.
		counter++;
		if (counter < boxes.length) {
			// Wait 0,25 seconds between every API request, otherwise we'll get only a part of all stations.
			setTimeout(function() { findGasStations(boxes,counter); }, 250);
		} else {
			// If we've found all gas stations on the route, determine what the cheapest one is.
			Car.findBestGasStation(gasArray);
		}
	},


	/* Finds all parking spots around the user's destination. */
	findParkingSpots: function() {
		
		var destination = {lat: journey.car.end.lat, lng: journey.car.end.lng };
		
		// Center map on destination.
		routeMap.setCenter(destination);
		routeMap.setZoom(15);

		// Use the Google Maps API to find nearby parking spots.
		placesService.nearbySearch({
			location: destination,
			radius: 1000,
			types: ['parking']
			}, function(results, status) {
				if (status === google.maps.places.PlacesServiceStatus.OK) {
					for (var i = 0; i < results.length; i++) {
						GoogleMaps.addMarker(results[i], 'parking', routeMap);
					}
				} else {
					window.alert('Helaas! We konden geen parkeerplaatsen vinden in de buurt van jouw bestemming.');
				}
			}
		);
	},


	/* Adds a parking spot/gas station marker (with an info window) to the map. */
	addMarker: function(place, type, map) {
		
		gasStations.push(place);
		
		// Based on Google's API documentation: https://developers.google.com/maps/documentation/javascript/examples/place-details.
		//var placeLoc = place.geometry.location;
		var marker = new google.maps.Marker({
			map: map,
			position: place.geometry.location,
			icon: 'images/markers/' + type + '.png'
		});
		
		// Add a listener to open the info window (with place's name + address) when the user clicks on the marker.
		google.maps.event.addListener(marker, 'click', function() {
			infoWindow.setContent('<strong>' + place.name + '</strong><br>' + place.vicinity);
			infoWindow.open(map, this);
		});
	},


	/* Initializes address bar with auto-complete from Google Maps API. */
	addressBar: function(inputId) {
		
		// Set up the Google Maps auto-complete API.
		var fromInput = document.getElementById(inputId);
		var options = {componentRestrictions: {country: 'nl'}};
		var autocomplete = new google.maps.places.Autocomplete(fromInput, options);
		
		// Auto-complete input with first suggestion when user presses enter button.
		google.maps.event.addDomListener(fromInput,'keydown',function(e){
			if (e.keyCode == 13 && !e.triggered){
				google.maps.event.trigger(this, 'keydown', {keyCode: 40});
				google.maps.event.trigger(this, 'keydown', {keyCode: 13, triggered:true});
			}
		});
	}

};