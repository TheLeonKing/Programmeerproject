/*
RESULT.JS
Contains all general JS functions (i.e. the ones not unique to the train or car journey) for the 'result' page.
Also contains all onClick listeners and UI initialization functions.
*/


var gasType,
	gasArray;


/* Initializes the accordion and dropdown. */
$(document).ready(function() {
	$('.ui.accordion').accordion({
		// Draw directions in Google Maps div when accordion opens (can't be done in advance because of resizing).
		onOpen: function () {
			// Open accordion.
			$('.ui.accordion').attr('open', true);

			// Draw car and train directions.
			google.maps.event.trigger(routeMap, 'resize');
			carDirectionsRenderer.setDirections(carResponse);
			trainDirectionsRenderer.setDirections(trainResponse);

			// Draw gas map with car directions and gas stations.
			google.maps.event.trigger(gasMap, 'resize');
			carDirectionsRendererGas.setDirections(carResponse);
		},
		collapsible: true
	});
	
	// Initialize dropdown in "Milieu (reis)" tab.
	$('.ui.dropdown').dropdown();
});


/* Opens the right accordion tab when user clicks menu item. */
$('.menu .item').click(function() {
	// Open accordion element at index defined in anchor's 'data-href'.
	var index = parseFloat($(this).attr('data-href'));
	$('.ui.accordion').accordion('open', index);
	
	// Scroll to the accordion tab we've just opened.
	$('html, body').animate({
		scrollTop: $('.title.active').offset().top
	}, 1000);
});


/* Scrolls to and shakes disclaimer (to get attention) when user clicks asterisk. */
$('.asterisk').click(function() {
	$('html, body').animate({
		scrollTop: $('.title.active').offset().top
	}, 1000);
	$('#disclaimer').transition('shake');
});


/* Shows the appropriate direction instructions when user clicks car/train button. */
$('.step').click(function() {
	// Set the right button as active.
	$('.step').removeClass('active');
	$(this).addClass('active');
	
	// Determine which directions we need to show and which to hide.
	if ($(this).attr('id') == 'carDirButton') {
		hide = '#directions_train';
		show = '#directions_car';
	} else if ($(this).attr('id') == 'trainDirButton') {
		hide = '#directions_car';
		show = '#directions_train';
	}
	
	// Fade 'hide' directions out and 'show' directions in.
	$(hide).stop(true);
	$(hide).fadeOut('slow', function() {
		$(show).stop(true);
		$(show).fadeIn('slow');
	});
});


/* Updates the emission stats when the user changes a dropdown value. */
$('#amountOfJourneys .item').click(function() {
	amountOfJourneys = parseInt($(this).text(), 10);
	Visualize.updateEmission();
});

$('#journeyFrequency .item').click(function() {
	journeyFrequency = $(this).text();
	Visualize.updateEmission();
});

$('#amountOfPersons .item').click(function() {
	amountOfPersons = parseInt($(this).text(), 10);
	Visualize.updateEmission();
});


var Result = {

	/* Calls all the appropriate functions for the car and train journey. */
	travel: function(fromLocation, toLocation, licensePlate, customStats, gasPrices) {
		
		GoogleMaps.initializeMap();
		
		// Find car route, duration and usage statistics.
		GoogleMaps.carRoute(fromLocation, toLocation).done(function(carJourney) {
			Car.fetchStats(customStats, licensePlate).done(function(userCar) {
				// Find train route and validate/fix it.
				GoogleMaps.trainRoute(fromLocation, toLocation).done(function(trainJourney) {
					GoogleMaps.trainOnly(trainJourney, $.Deferred()).done(function(trainJourney) {
						// Extract the beginning and end station from the train route, then calculate the price based on these stations.
						Train.findStations(trainJourney.steps, fromLocation).done(function(journeyStations) {
							Train.findPrice(journeyStations).done(function(trainPrice) {
								
								// Calculate gas price based of car journey.
								carPrice = Car.calculateGasPrice(carJourney.distance.value / 1000, gasPrices[userCar.gasType].average, userCar);
								
								// Calculate CO2 emission of both car and train journey.
								carEmission = Car.totalEmission(carJourney.distance.value/1000, userCar.co2Emission);
								trainEmission = Train.totalTrainEmission(trainJourney.distance.value/1000);
								
								// Create a 'journey' object containing all the information we've just gathered.
								journey = {
									car: {
										duration: { text: carJourney.duration.text, value: carJourney.duration.value },
										distance: { total: (carJourney.distance.value/1000) },
										start: { lat: carJourney.start_location.lat(), lng: carJourney.start_location.lng() },
										end: { lat: carJourney.end_location.lat(), lng: carJourney.end_location.lng() },
										price: carPrice,
										emission: carEmission
									},
									train: {
										duration: { text: trainJourney.duration.text, value: trainJourney.duration.value },
										distance: { total: (trainJourney.distance.value/1000), train: Train.totalTrainDistance(trainJourney.steps) },
										start: { lat: trainJourney.start_location.lat(), lng: trainJourney.start_location.lng() },
										end: { lat: trainJourney.end_location.lat(), lng: trainJourney.end_location.lng() },
										price: trainPrice,
										emission: trainEmission
									}
								};
								
								// Print results to page.
								Result.printStats(journey);
								Result.printTravelAdvice(carJourney, trainJourney);
								
								// Find gas type from user's car and retrieve all gas stations.
								Car.findGasType(userCar.gasType, gasPrices);
								GoogleMaps.findGasStations(boxes, 0);
								
								// Initialize the visualizations.
								Visualize.initialize(journey, userCar);
							
							// If 'findPrice' failed (i.e. NS price matrix didn't contain the necessary information).
							}).fail(function(error) { Result.launchError(error); });
						// If 'findStations' failed (i.e. one or both train station(s) couldn't be found).
						}).fail(function(error) { Result.launchError(error); });
					// If 'trainOnly' failed (i.e. route doesn't contain train steps).
					}).fail(function(error) { Result.launchError(error); });
				// If 'trainRoute' failed (i.e. Google Maps API failed to find a train route).
				}).fail(function(error) { Result.launchError(error); });
			// If 'fetchStats' failed (i.e. RDW API didn't return usage statistics for the user's car).
			}).fail(function(error) { Result.launchError(error); });
		// If 'carRoute' failed (i.e. Google maps failed to find a car route).
		}).fail(function(error) { Result.launchError(error); });
	},


	/* Returns the user to the index page with an error (avoids code repetition). */
	launchError: function(error) {
		window.location = 'index.php?error=' + error;
	},


	/* Prints the statistics about price, duration, etc. to the DOM. */
	printStats: function(journey) {
		
		// Find lowest price and print price stats.
		priceWinner = this.findWinner(journey.car.price, journey.train.price, 'price');
		this.setElement('price_winner', priceWinner);
		this.setElement('price_car', journey.car.price);
		this.setElement('price_train', journey.train.price);
		
		// Find shortest duration and print duration stats.
		durationWinner = this.findWinner(journey.car.duration.value, journey.train.duration.value, 'duration');
		this.setElement('duration_winner', durationWinner);
		this.setElement('duration_car', journey.car.duration.text);
		this.setElement('duration_car_detail', journey.car.duration.text);
		this.setElement('duration_train', journey.train.duration.text);
		this.setElement('duration_train_detail', journey.train.duration.text);
		
		// Find lowest emission and print emission stats.
		emissionWinner = this.findWinner(journey.car.emission, journey.train.emission, 'emission');
		this.setElement('emission_winner', emissionWinner);
		this.setElement('emission_car', Visualize.thousandsSeparators(journey.car.emission));
		this.setElement('emission_train', Visualize.thousandsSeparators(journey.train.emission));
	},


	/* Finds out which scores better (=lower): car or train (avoids code repetition). */
	findWinner: function(car, train, type) {
		if (car == train) {
			winner = 'EVEN SNEL';
		} else if (car > train) {
			winner = 'TREIN';
			this.setColors(type, 'train', 'car');
		} else {
			winner = 'AUTO';
			this.setColors(type, 'car', 'train');
		}
		
		return winner;
	},


	/* Gives an element with a specified ID a specified value (avoids code repetition). */
	setElement: function(id, string) {
		$('#' + id).html(string);
	},


	/* Sets price/train color to green/red, depending on which of the two is the 'winner' (avoids code repetition). */
	setColors: function(type, winner, loser) {
		$('#' + type + '_' + winner + '_container').css('color', 'rgb(0,163,0)');
		$('#' + type + '_' + loser + '_container').css('color', 'rgb(238,17,17)');
	},


	/* Prints the travel advice for both the car and train journey to the DOM. */
	printTravelAdvice: function(carJourney, trainJourney) {
		Car.printTravelAdvice(carJourney);
		Train.printTravelAdvice(trainJourney);
	},


	/* Adds a single instruction to the DOM (avoids code repetition). */
	addInstruction: function(instruction, description, transitType, travelMode) {
		
		// Set icon as marker by default.
		var icon = 'fa fa-map-marker';
		
		// Choose the right icon for the travel mode.
		if (travelMode == 'WALKING') {
			icon = 'ion-android-walk';
		} else if (travelMode == 'DRIVING') {
			icon = 'fa fa-car';
		} else if (travelMode == 'TRANSIT') {
			icon = 'fa fa-train';
		}
		
		// Add instruction to DOM.
		$('#directions_' + transitType).append('<div class="item"><i class="large icon ' + icon + ' middle aligned"></i><div class="content">' + instruction + '<div class="description">' + description + '</div></div></div>');
	},


	/* Checks if a journey is valid (i.e. contains either car or train steps). */
	isValid: function(steps, travelType) {
		// Journey is not valid if it consists of one step or less.
		if (steps.length <= 1) {
			return false;
		}
		
		// Journey is valid if at least one step is of the 'travelType' type.
		for (var i = 0, l = steps.length; i < l; i++) {
			if (steps[i].travel_mode == travelType) {
				return true;
			}
		}
		
		return false;
	},


	/* Removes the loading screen after all important visualizations are on the DOM. */
	removeLoadingScreen: function() {
		$('#loadOverlay').hide();
	}

};