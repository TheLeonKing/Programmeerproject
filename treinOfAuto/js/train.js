/*
TRAIN.JS
Contains all JS functions that are unique to the train journey.
*/


var Train = {

	/* Takes a steps object, returns the abbreviations of the beginning and end train station. */
	findStations: function(steps, fromLocation) {	
		
		var dfd = $.Deferred();
		
		// Extract the beginning and end train station.
		journeyStations = Train.extractStations(steps);
		
		// Read 'stations.csv' with D3, which contains both the abbreviation and full name(s) of each station.
		d3.csv('data/ns_stations.csv', function(stations) {
			
			// Loop over each station, find the codes of the 'from' and 'to' stations.
			for (var i = 0, l = stations.length; i < l; i++) {
				if (stations[i].korte_naam == journeyStations.from || stations[i].middel_naam == journeyStations.from || stations[i].naam == journeyStations.from) {
					journeyStations.fromCode = stations[i].code;
				} else if (stations[i].korte_naam == journeyStations.to || stations[i].middel_naam == journeyStations.to || stations[i].naam == journeyStations.to) {
					journeyStations.toCode = stations[i].code;
				}
			}
			
			// Return the codes, or show an error if we couldn't find the codes for both stations.
			if (journeyStations.hasOwnProperty('fromCode') && journeyStations.hasOwnProperty('toCode')) {
				dfd.resolve(journeyStations);
			} else {
				dfd.reject('We konden de treinstations van uw reis niet vinden in de database. Contacteer alstublieft de webmaster.');
			}
		});
		
		return dfd.promise();
	},


	/* Extracts the beginning and the end train stations from a steps object. */
	extractStations: function(steps) {
		
		// Create new array with just the instructions that start with "Trein".
		var stepsFiltered = steps.filter(
			function (v, i) { v.index = i; return (v.instructions).match('^Trein'); }
		);
		
		// Extract beginning station from first transit step and end station from last transit step.
		fromStation = this.cleanStationName(stepsFiltered[0].transit.departure_stop.name);
		toStation = this.cleanStationName($(stepsFiltered).get(-1).transit.arrival_stop.name);
		
		return {'from': fromStation, 'to': toStation};
	},


	/* Cleans the station name (e.g. 'Amsterdam, Amstelstation' to 'Amstel'). */
	cleanStationName: function(stationName) {
		// Split the station name by comma (sometimes the station's location is included in the name, e.g. 'Amsterdam, Amstelstation').
		var parts = stationName.split(',');
		
		// Take the part after the last comma, remove 'station' if present, and trim whitespaces.
		return $.trim(parts[parts.length-1].replace('station',''));
	},


	/* Find the price of a train journey between two stations. */
	findPrice: function(journeyStations) {
		
		var dfd = $.Deferred();
		
		// Read 'ns_tariefeenheden.csv', a matrix that contains the amount of tariff units between two stations.
		d3.csv('data/ns_tariefeenheden.csv', function(matrix) {
			
			// Find the value at the coordinate (fromCode, toCode) in the price matrix.
			for (var i = 0, l = matrix.length; i < l; i++) {
				if (matrix[i].Station == journeyStations.fromCode) {
					tariffUnit = matrix[i][journeyStations.toCode];
				}
			}
			
			// Some columns in the matrix contain a '?'. This is an error on NS's
			// side. I can't fix that error, but I can gracefully handle it.
			if (tariffUnit == '?') {
				dfd.reject('We konden geen prijs vinden voor een reis tussen deze stations. Neem contact op met de webmaster');
			}
			
			// Read 'ns_tarieven.csv', which contains the price for each amount of tariff units.
			d3.csv('data/ns_tarieven.csv', function(tariffs) {
				
				// Find the price corresponding to the tariff unit.
				for (var i = 0, l = tariffs.length; i < l; i++) {
					if (tariffs[i].tariefeenheid == tariffUnit) {
						dfd.resolve(tariffs[i].tweede_klas_vol_tarief);
					}
				}
			});
		});
		
		return dfd.promise();
	},


	/* Calculates how many kilometers the train drives. */
	totalTrainDistance: function(steps) {
		// Find all steps that involve a train (a journey with transfers has multiple train steps).
		var stepsFiltered = steps.filter(
			function (v, i) { v.index = i; return (v.instructions).match('^Trein'); }
		);
		
		// Add the distance of each step to the total distance travelled by train.
		totalDistance = 0;
		for (var i = 0, l = stepsFiltered.length; i < l; i++) {
			totalDistance += stepsFiltered[i].distance.value;
		}
		
		// Convert total distance from meters to kilometers, and return it.
		return totalDistance/1000;
	},

	
	/* Calculates CO2 emission in grams per kilometer. */
	totalTrainEmission: function(distance) {
		// Number '30.1' based on an official report by NS from 2013: http://goo.gl/kYZJms.
		return parseInt(distance * 30.1, 10);
	},
	
	
	/* Prints the train travel advice to the DOM. */
	printTravelAdvice: function(trainJourney) {
		
		// Add first instruction (indicating the starting point + departure time).
		startAddress = trainJourney.start_address;
		departureTime = trainJourney.departure_time.text;
		Result.addInstruction('Start op <strong>' + startAddress + '</strong>', 'Vertrek om ' + departureTime, 'train');
		
		steps = trainJourney.steps;
		
		// Loop over all instruction steps.
		for (var i = 0, l = steps.length; i < l; i++) {
			distance = steps[i].distance.text;
			duration = steps[i].duration.text;
			travelMode = steps[i].travel_mode;
			
			// If this is a transit step, extract the station at which the user should leave the
			// train ('steps[i].instructions' here states the end station of the train,
			// e.g. 'Rotterdam Centraal' while the user should leave at 'Amsterdam Centraal').
			if ((steps[i]).hasOwnProperty('transit')) {
				instruction = 'Trein naar ' + steps[i].transit.arrival_stop.name + ' (vertrek ' + steps[i].transit.departure_time.text + ')';
				details = distance + ' - ' + duration;
			} else {
				instruction = steps[i].instructions;
			}
			
			Result.addInstruction(instruction, distance + ' - ' + duration, 'train', steps[i].travel_mode);
		}
		
		// Set arrival time as departure time + journey duration.
		var arrivalTime = new Date(new Date().getTime() + (trainJourney.duration.value * 1000));
		arrivalTime = arrivalTime.getHours() + ':' + ('0' + arrivalTime.getMinutes()).substr(-2);
		
		// Add last instruction (indicating the ending point + arrival time).
		endAddress = trainJourney.end_address;	
		Result.addInstruction('Gearriveerd op <strong>' + endAddress + '</strong>', 'Aankomst om ' + arrivalTime, 'train');
		
		// Add departure and arrival time to the train directions button.
		$('#trainDirButton .bDescription').html(departureTime + ' - ' + arrivalTime);
	}

};