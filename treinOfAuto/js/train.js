/*
TRAIN.JS
Contains all JS functions that are unique for the train journey.
*/


/* Takes a steps object, returns the abbreviations of the beginning and end train station. */
function findTrainStations(steps, fromLocation) {	
	
	var dfd = $.Deferred();
	
	// Extract the beginning and end train station.
	journeyStations = extractStations(steps);
	
	// Find abbreviations of station names: read 'stations' CSV file with D3.
	d3.csv('data/ns_stations.csv', function(stations) {
		
		// Loop over each station, find the codes of the 'from' and 'to' stations.
		for (var i = 0, l = stations.length; i < l; i++) {
			if (stations[i]['korte_naam'] == journeyStations.from || stations[i]['middel_naam'] == journeyStations.from || stations[i]['naam'] == journeyStations.from) {
				journeyStations['fromCode'] = stations[i]['code'];
			}
			else if (stations[i]['korte_naam'] == journeyStations.to || stations[i]['middel_naam'] == journeyStations.to || stations[i]['naam'] == journeyStations.to) {
				journeyStations['toCode'] = stations[i]['code'];
			}
		}
	
		
		// Show an error if we couldn't find the matching station codes.
		if (journeyStations.hasOwnProperty('fromCode') && journeyStations.hasOwnProperty('toCode')) {
			dfd.resolve(journeyStations);
		}
		else {
			dfd.reject('We konden de treinstations van uw reis niet vinden in de database. Contacteer alstublieft de webmaster.');
		};
	});
	
	return dfd.promise();
}


/* Extracts the beginning and the end train stations from a steps object. */
function extractStations(steps) {
	
	// Create new array with just the instructions that start with "Trein".
	var stepsFiltered = steps.filter(
		function (v, i) { v.index = i; return (v.instructions).match('^Trein') }
	);
	
	// Extract beginning station from first transit step and end station from last transit step.
	fromStation = cleanStationName(stepsFiltered[0]['transit']['departure_stop']['name']);
	toStation = cleanStationName($(stepsFiltered).get(-1)['transit']['arrival_stop']['name']);
	
	return {'from': fromStation, 'to': toStation};
}


/* Cleans the station name. */
function cleanStationName(stationName) {
	// Split the station name (sometimes the station's location is included in the name, e.g. 'Amsterdam, Amstelstation').
	var parts = stationName.split(',');
	// Take the part after the last comma and remove 'station' if present (e.g. 'Amsterdam, Amstelstation' to 'Amstel').
	return parts[parts.length-1].replace('station','');
}


function findTrainPrice(journeyStations) {
	
	var dfd = $.Deferred();
	
	d3.csv('data/ns_tariefeenheden.csv', function(matrix) {
		
		// Find the value at the coordinate (fromCode, toCode) in the price matrix.
		for (var i = 0, l = matrix.length; i < l; i++) {
			if (matrix[i]['Station'] == journeyStations['fromCode']) {
				tariffUnit = matrix[i][journeyStations['toCode']];
			}
		}
		
		d3.csv('data/ns_tarieven.csv', function(tariffs) {
			// Find the price corresponding to the tariff unit.
			for (var i = 0, l = tariffs.length; i < l; i++) {
				if (tariffs[i]['tariefeenheid'] == tariffUnit) {
					dfd.resolve(tariffs[i]['tweede_klas_vol_tarief']);
				}
			}
		});
	});
	
	return dfd.promise();
}


/* Calculates how many kilometers the train drives. */
function totalTrainDistance(steps) {
	// Find all steps that involve a train (a journey with transfers has multiple steps).
	var stepsFiltered = steps.filter(
		function (v, i) { v.index = i; return (v.instructions).match('^Trein') }
	);
	
	// Add the distance of each step to the total distance travelled by train.
	totalDistance = 0;
	for (var i = 0, l = stepsFiltered.length; i < l; i++) {
		totalDistance += stepsFiltered[i].distance.value;
	}
	
	// Return total distance in kilometers.
	return totalDistance/1000;
}

/* Calculates CO2 emission in grams per kilometer. */
function totalTrainEmission(distance) {
	// Number '30.1' based on an official report by NS from 2013: http://goo.gl/kYZJms.
	return parseInt(distance * 30.1);
}