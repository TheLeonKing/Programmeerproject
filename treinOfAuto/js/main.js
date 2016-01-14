/*
MAIN.JS
Contains all general JS functions (i.e. the ones not unique to the train or car journey).
*/

var gasType,
	gasArray;

/* Initializes the accordion and dropdown. */
$(document).ready(function(){
	$('.ui.accordion').accordion({
		// Draw directions in Google Maps div when accordion opens (can't be done in advance because of resizing).
		onOpen: function () {
            $('.ui.accordion').attr('open', true);
			google.maps.event.trigger(routeMap, 'resize');
			carDirectionsRenderer.setDirections(carResponse);
			trainDirectionsRenderer.setDirections(trainResponse);
			google.maps.event.trigger(gasMap, 'resize');
			carDirectionsRendererGas.setDirections(carResponse);
        }
		, collapsible: true
	});
	
	$('.ui.dropdown')
		.dropdown()
	;
});


/* Shows the appropriate direction instructions when the button is clicked. */
$('.step').click(function() {
	// Set the right button as active.
	$('.step').removeClass('active');
	$(this).addClass('active');
	
	// Determine which directions we need to show and which to hide.
	if ($(this).attr('id') == 'carDirButton') {
		hide = '#directions_train';
		show = '#directions_car';
	}
	else if ($(this).attr('id') == 'trainDirButton') {
		hide = '#directions_car';
		show = '#directions_train';
	}
	
	// Fade directions in and out.
	$(hide).stop(true);
	$(hide).fadeOut('slow', function() {
		$(show).stop(true);
		$(show).fadeIn('slow');
	});
});


/* Calculates travel routes + statistics for both car and train. */
function travel(fromLocation, toLocation, licensePlate, gasPrices) {
	
	initializeMap();
	
	// Find car route, duration and usage statistics.
	carTravel(fromLocation, toLocation).done(function(carJourney) {
		fetchCarStats(licensePlate).done(function(userCar) {
			// Find train route.
			trainTravel(fromLocation, toLocation).done(function(trainJourney) {
				// Extract the beginning and end station from the train route, calculate the price based on these stations.
				findTrainStations(trainJourney.steps, fromLocation).done(function(journeyStations) {
					fetchTrainTravelAdvice(journeyStations).done(function(trainTravelAdvice) {
						findTrainPrice(journeyStations).done(function(trainPrice) {
							
							// Calculate gas price of car journey.
							carPrice = calculateGasPrice(licensePlate, carJourney, gasPrices, userCar);
							
							// Calculate CO2 emission of both car and train journey.
							carEmission = totalCarEmission(carJourney.distance.value/1000, userCar['co2Emission']);
							trainEmission = totalTrainEmission(trainJourney.distance.value/1000);
							
							// Create a 'journey' object containing all the information we've just gathered.
							journey = {
								car: { duration: { text: carJourney.duration.text, value: carJourney.duration.value }, distance: { total: (carJourney.distance.value/1000) }, start: { lat: carJourney.start_location.lat(), lng: carJourney.start_location.lng() }, end: { lat: carJourney.end_location.lat(), lng: carJourney.end_location.lng() }, price: carPrice, emission: carEmission },
								train: { duration: { text: trainJourney.duration.text, value: trainJourney.duration.value }, distance: { total: (trainJourney.distance.value/1000), train: totalTrainDistance(trainJourney.steps) }, start: { lat: trainJourney.start_location.lat(), lng: trainJourney.start_location.lng() }, end: { lat: trainJourney.end_location.lat(), lng: trainJourney.end_location.lng() }, price: trainPrice, emission: trainEmission }
							};
							
							// Print results to page.
							printStats(journey);
							printTravelAdvice(carJourney, trainJourney);
							findGasType(userCar['gasType'], gasPrices);
							findGasStations(boxes, 0);
							visualize(journey);
							
						});
					})
					// If 'fetchTrainTravelAdvice' failed (i.e. no train travel advice was found).
					.fail(function(error) { console.log(error); });
				})
				// If 'findTrainStations' failed (i.e. one or both train station(s) couldn't be found).
				.fail(function(error) { console.log(error); });
			})
			// If 'trainTravel' failed (i.e. Google Maps API failed to find a train route).
			.fail(function(error) { console.log(error); });
		})
		// If 'fetchCarStats' failed (i.e. RDW API didn't return usage statistics for the user's car).
		.fail(function(error) { console.log(error); });
	})
	// If 'carTravel' failed (i.e. Google maps failed to find a car route).
	.fail(function(error) { console.log(error); });
}


/* Prints the statistics about price, duration, etc. to the page. */
function printStats(journey) {
	
	priceWinner = findWinner(journey.car.price, journey.train.price, 'price');
	setElement('price_winner', priceWinner);
	setElement('price_car', journey.car.price);
	setElement('price_train', journey.train.price);
	
	durationWinner = findWinner(journey.car.duration.value, journey.train.duration.value, 'duration');
	setElement('duration_winner', durationWinner);
	setElement('duration_car', journey.car.duration.text);
	setElement('duration_car_detail', journey.car.duration.text);
	setElement('duration_train', journey.train.duration.text);
	setElement('duration_train_detail', journey.train.duration.text);
	
	emissionWinner = findWinner(journey.car.emission, journey.train.emission, 'emission');
	setElement('emission_winner', emissionWinner);
	setElement('emission_car', journey.car.emission);
	setElement('emission_train', journey.train.emission);
}


/* Finds out which scores higher: car or train (avoids code repetition). */
function findWinner(car, train, type) {
	if (car == train) {
		winner = 'EVEN SNEL';
	}
	else if (car > train) {
		winner = 'TREIN';
		setColors(type, 'train', 'car');
	}
	else {
		winner = 'AUTO';
		setColors(type, 'car', 'train');
	}
	
	return winner;
}


/* Gives an element with a specified ID a specified value. */
function setElement(id, string) {
	$('#' + id).html(string);
}


/* Sets price/train color to green/red, depending on which of the two is the 'winner'. */
function setColors(type, winner, loser) {
	$('#' + type + '_' + winner + '_container').css('color', 'rgb(0,163,0)');
	$('#' + type + '_' + loser + '_container').css('color', 'rgb(238,17,17)');
}


/* Prints the travel advice to the DOM. */
function printTravelAdvice(carJourney, trainJourney) {
	printCarTravelAdvice(carJourney);
	printTrainTravelAdvice(trainJourney);
}


/* Prints the car travel advice to the DOM. */
function printCarTravelAdvice(carJourney) {
	
	// Set departure time as current time and arrival time as current time + journey duration.
	var departureTime = new Date();
	var arrivalTime = new Date(departureTime.getTime() + (carJourney.duration.value * 1000));
	
	// Convert departure and arrival time from date object to string.
	departureTime = departureTime.getHours() + ':' + ('0' + departureTime.getMinutes()).substr(-2);
	arrivalTime = arrivalTime.getHours() + ':' + ('0' + arrivalTime.getMinutes()).substr(-2);
	
	// Add first instruction (indicating the starting point).
	startAddress = carJourney['start_address'];
	addInstruction('Start op <strong>' + startAddress + '</strong>', 'Vertrek om ' + departureTime, 'car');		
	
	steps = carJourney['steps'];
	
	// Loop over all instruction steps.
	for (var i = 0, l = steps.length; i < l; i++) {
		instruction = steps[i]['instructions'];
		distance = steps[i]['distance']['text'];
		duration = steps[i]['duration']['text'];
		travelMode = steps[i]['travel_mode'];
		
		addInstruction(instruction, distance + ' - ' + duration, 'car', steps[i]['travel_mode']);
	}
	
	// Add last instruction (indicating the ending point).
	endAddress = carJourney['end_address'];
	addInstruction('Gearriveerd op <strong>' + endAddress + '</strong>', 'Aankomst om ' + arrivalTime, 'car');
	
	// Add departure and arrival time to button.
	$('#carDirButton .bDescription').html(departureTime + ' - ' + arrivalTime);
	
}


/* Prints the train travel advice to the DOM. */
function printTrainTravelAdvice(trainJourney) {
	
	// Add first instruction (indicating the starting point + departure time).
	startAddress = trainJourney['start_address'];
	departureTime = trainJourney['departure_time']['text'];
	addInstruction('Start op <strong>' + startAddress + '</strong>', 'Vertrek om ' + departureTime, 'train');
	
	steps = trainJourney['steps'];
	
	// Loop over all instruction steps.
	for (var i = 0, l = steps.length; i < l; i++) {
		distance = steps[i]['distance']['text'];
		duration = steps[i]['duration']['text'];
		travelMode = steps[i]['travel_mode'];
		
		// If this is a transit step, extract the station the user should leave the
		// train ('steps[i]['instructions']' here states the end station of the train,
		// e.g. 'Rotterdam Centraal' while the user should leave at 'Amsterdam Centraal').
		if ((steps[i]).hasOwnProperty('transit')) {
			instruction = 'Trein naar ' + steps[i]['transit']['arrival_stop']['name'] + ' (vertrek ' + steps[i]['transit']['departure_time']['text'] + ')';
			details =  + distance + ' - ' + duration;
		}
		else {
			instruction = steps[i]['instructions'];
		}
		
		addInstruction(instruction, distance + ' - ' + duration, 'train', steps[i]['travel_mode']);
	}
	
	// Add last instruction (indicating the ending point + arrival time).
	endAddress = trainJourney['end_address'];
	arrivalTime = trainJourney['arrival_time']['text'];		
	addInstruction('Gearriveerd op <strong>' + endAddress + '</strong>', 'Aankomst om ' + arrivalTime, 'train');
	
	// Add departure and arrival time to button.
	$('#trainDirButton .bDescription').html(departureTime + ' - ' + arrivalTime);
}


/* Adds a single instruction to the DOM (avoids code repetition). */
function addInstruction(instruction, description, transitType, travelMode) {
	
	// Choose the right icon for the transit type.
	if (travelMode == 'WALKING') {
		icon = 'ion-android-walk';
	}
	else if (travelMode == 'DRIVING') {
		icon = 'fa fa-car';
	}
	else if (travelMode == 'TRANSIT') {
		icon = 'fa fa-train';
	}
	else {
		icon = 'fa fa-map-marker';
	}
	
	// Add instruction to DOM.
	$('#directions_' + transitType).append('<div class="item"><i class="large icon ' + icon + ' middle aligned"></i><div class="content">' + instruction + '<div class="description">' + description + '</div></div></div>');
}