/*
MAIN.JS
Contains all general JS functions (i.e. the ones not unique to the train or car journey).
*/

/* Initializes the accordion. */
$(document).ready(function(){
	$('.ui.accordion').accordion({
		// Draw directions in Google Maps div when accordion opens (can't be done in advance because of resizing).
		onOpen: function () {
            $('.ui.accordion').attr('open', true);
			google.maps.event.trigger(map, 'resize');
			carDirectionsRenderer.setDirections(carResponse);
			trainDirectionsRenderer.setDirections(trainResponse);
        }
		, collapsible: true
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
					findTrainPrice(journeyStations).done(function(trainPrice) {
						
						// Calculate gas price of car journey.
						carPrice = calculateGasPrice(licensePlate, carJourney, gasPrices, userCar);
						
						// Calculate CO2 emission of both car and train journey.
						carEmission = totalCarEmission(carJourney.distance.value/1000, userCar['co2Emission']);
						trainEmission = totalTrainEmission(trainJourney.distance.value/1000);
						
						
						// Create a 'journey' object containing all the information we've just gathered.
						journey = {
							car: { duration: { text: carJourney.duration.text, value: carJourney.duration.value }, distance: { total: (carJourney.distance.value/1000) }, price: carPrice, emission: carEmission },
							train: { duration: { text: trainJourney.duration.text, value: trainJourney.duration.value }, distance: { total: (trainJourney.distance.value/1000), train: totalTrainDistance(trainJourney.steps) }, price: trainPrice, emission: trainEmission }
						};
						
						// Print results to page.
						printStats(journey);
						visualize(journey, userCar, gasPrices);
						
					});
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
	
	findWinner(journey.car.emission, journey.train.emission, 'emission');
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