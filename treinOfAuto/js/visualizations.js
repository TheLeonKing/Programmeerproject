/*
VISUALIZATIONS.JS
Contains all codes for the visualizations.
*/

var amountOfJourneys = 1,
	journeyFrequency = 'jaar',
	amountOfPersons = 1,
	defaultBarOptions = {},
	emissionChart;


// If the user changes a dropdown value, update the emission stats.
$('#amountOfJourneys .item').click(function() {
	amountOfJourneys = parseInt($(this).text());
	updateEmission();
});

$('#journeyFrequency .item').click(function() {
	journeyFrequency = $(this).text();
	updateEmission();
});

$('#amountOfPersons .item').click(function() {
	amountOfPersons = parseInt($(this).text());
	updateEmission();
});


/* Draws the visualizations to the DOM. */
function visualize(journey, userCar) {
	
	// Default bar chart options.
	defaultBarOptions = {
		responsiveAnimationDuration: 1000,
		legend: {
			display: false
		},
		scales:{
			yAxes: [{
					ticks:{
						fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
						fontSize: 10,
					},
					scaleLabel: {
						display: true,
						fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
						fontStyle: 'bold',
						fontSize: 10,
					}
				}],
			xAxes: [{
					ticks:{
						fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
						fontSize: 10,
					},
					scaleLabel: {
						display: true,
						fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
						fontStyle: 'bold',
						fontSize: 10,
					},
					gridLines: {
						display: false
					}
				}]
		},
		title: {
			display: true,
			fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
			fontStyle: 'bold'
		}
	};
	
	
	drawSimpleBarChart('priceChart', 'Prijs autoreis vs. treinreis', "Prijs (in euro's)", 'Prijs reis', '€', [journey.car.price, journey.train.price], defaultBarOptions);
	drawSimpleBarChart('durationChart', 'Reisduur autoreis vs. treinreis', 'Reisduur (in minuten)', 'Reisduur', 'minuten', [parseInt(journey.car.duration.value/60), parseInt(journey.train.duration.value/60)], defaultBarOptions);

	drawGasStationsChart(journey.car.distance.total, userCar);
	
	emissionChart = drawSimpleBarChart('emissionChart', 'Jaarlijkse CO2-uitstoot (per persoon) autoreis vs. treinreis', 'CO2-uitstoot per persoon per jaar (gram)', 'CO2-uitstoot', 'gram', [journey.car.emission, journey.train.emission], defaultBarOptions);
	visualizeTrees(journey.car.emission, journey.train.emission);
	
	regionChart();
}


/* Draws a simple bar chart, with only a 'Car' and a 'Train' bar (avoids code repetition). */
function drawSimpleBarChart(chartID, title, yLabel, tooltipLabel, tooltipSuffix, chartData, defaultBarOptions) {
	// Chart data.
	var chartData = {
		labels: ['Auto', 'Trein'],
		datasets: [{
			label: tooltipLabel,
			// Verified color-blind friendly colors http://colorbrewer2.org/.
			backgroundColor: ['rgba(239, 138, 98, 0.9)', 'rgba(103, 169, 207, 0.9)'],
			data: chartData,
		}]
	};
	
	// Options specific to this chart (in addition to the defaultBarOptions).
	var chartOptions = {
		tooltips: {
			callbacks: {
				label: function(tooltipItem, data) {
					return tooltipItem.xLabel + ': ' + tooltipItem.yLabel + ' ' + tooltipSuffix;
				}
			}
		},
		scales:{
			yAxes:[{
					ticks:{
						beginAtZero: true
					},
					scaleLabel: {
						labelString: yLabel
					},
				}],
			xAxes:[{
					scaleLabel: {
						labelString: 'Vervoertype'
					},
				}]
		},
		title: {
			text: title
		}
	};
	
	// Draw chart.
	var ctxChart = document.getElementById(chartID).getContext('2d');
	return new Chart(ctxChart, {
		type: 'bar',
		data: chartData,
		options: $.extend(true, defaultBarOptions, chartOptions)
	});
}


/* Draws a more complex bar chart, comparing the gas prices at the different stations. */
function drawGasStationsChart(distance, userCar) {
	
	var data = [];
	
	// Convert object to list with nested arrays (e.g. 'bp: 15.24' to '{ gasStation: bp, price: 15.24 }')
	$.each(gasArray, function(key, value) {
		// Exclude the average price from the bar chart.
		if (key !== 'average') {
			data.push({'gasStation': key, 'price': calculateGasPrice(distance, value, userCar) });
		}
	});
	
	// Based on the Simple Bar Chart from the D3.JS wiki: http://bl.ocks.org/mbostock/3885304.

	var margin = {top: 25, right: 0, bottom: 40, left: 70},
		width = 400 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;
		
	var formatEuro = d3.format('.2f');

	var x = d3.scale.ordinal()
		.rangeRoundBands([0, width], .1);

	// The horizontal 'average' line.
	var xAverage = d3.scale.ordinal()
		.rangeBands([0, width+margin.left], 0);

	var y = d3.scale.linear()
		.range([height, 0]);

	// X axis.
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom'); 

	// Y axis.
	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left')
		.tickFormat(formatEuro);
	
	// Tooltip.
	var tooltip = d3.tip()
		.attr('class', 'tooltip')
		.offset([-10, 0])
		.html(function(d) {
			return '<strong>Prijs <span class="gasStation">' + d.gasStation + '</span>:</strong> <span class="price">&#8364;' + (d.price).toString().replace('.', ',') + '</span>';
		})

	var svg = d3.select('#gasPricesChart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	svg.call(tooltip);	
	
	data.forEach(function(d) {
		d.price = +d.price;
	});
	
	// Calculate lower and upper bound for Y axis.
	yLower = d3.min(data, function(d) { return (d.price-(d.price/200)).toFixed(2); });
	yUpper = d3.max(data, function(d) { return (d.price+(d.price/200)).toFixed(2); });
	
	// Set up X domain (all gas types) and Y domain (calculated above).
	x.domain(data.map(function(d) { return d.gasStation; }));
	xAverage.domain(data.map(function(d) { return d.gasStation; }));
	y.domain([yLower, yUpper]);
	
	// Draw chart title.
	svg.append('text')
		.attr('x', (width / 2))             
		.attr('y', 0 - (margin.top / 2))
		.attr('class', 'chartTitle')
		.text('Actuele prijzen ' + gasType.toUpperCase() + ' per benzinestation');
	
	// Draw X axis.
	svg.append('g')
		.attr('class', 'x axis')
		.attr('transform', 'translate(0,' + height + ')')
		.call(xAxis)
		.append('text')
		.attr('transform', 'translate(' + (width / 2) + " ," + (margin.bottom-5) + ')')
		.attr('class', 'axisLabel')
        .style('text-anchor', 'middle')
		.text('Benzinestation');

	// Draw Y axis.
	svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis)
		.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '-5em')
		.attr('class', 'axisLabel')
		.text('Prijs ' + gasType + ' (in euro\'s)');

	// Draw the bars.
	svg.selectAll('.bar')
		.data(data)
		.enter().append('rect')
		.attr('class', 'bar')
		.attr('x', function(d) { return x(d.gasStation); })
		.attr('width', x.rangeBand())
		.attr('y', function(d) { return y(d.price); })
		.attr('height', function(d) { return height - y(d.price); })
		.on('mouseover', tooltip.show)
		.on('mouseout', tooltip.hide);

	// Calculate the sum of all prices.
	var priceTotal = d3.sum(data, function(d) { return d.price; }); 

	// Calculate the average of all gas prices using the priceTotal.
	var averageLine = d3.svg.line()
	.x(function(d, i) { 
		return xAverage(d.gasStation) + i;
	})
	.y(function(d, i) { return y(priceTotal/data.length); }); 

	// Add the average price line.
	svg.append('path')
		.datum(data)
		.attr('class', 'line')
		.attr('d', averageLine)
		.attr('id', 'averageLine');
		
	// Add a label to the average price line.
	svg.append('text')
		.attr('x', width/2)
		.attr('dy', -6)
		.append('textPath')
		.attr('xlink:href', '#averageLine')
		.attr('class', 'averageLineLabel')
		.text('Gemiddeld: €' + (priceTotal/data.length).toFixed(2).toString().replace('.', ','));

}


/* Update the emission stats after the user changed a statistic. */
function updateEmission() {
	// Find out the 'amountOfJourneys' per year.
	if (journeyFrequency == 'week') {
		var amountOfJourneysYear = amountOfJourneys * 52;
	}
	else if (journeyFrequency == 'maand') {
		var amountOfJourneysYear = amountOfJourneys * 12;
	}
	else {
		var amountOfJourneysYear = amountOfJourneys;
	}
	
	// Calculate new emission numbers.
	var newCarEmission = parseInt((journey.car.emission/amountOfPersons)*amountOfJourneysYear);
	var newTrainEmission = parseInt(journey.train.emission*amountOfJourneysYear);
	
	// Update statistics on DOM.
	emissionWinner = findWinner(newCarEmission, newTrainEmission, 'emission');
	setElement('emission_winner', emissionWinner);
	setElement('emission_car', newCarEmission);
	setElement('emission_train', newTrainEmission);
	
	// Update chart.
	emissionChart.data.datasets[0].data[0] = newCarEmission;
	emissionChart.data.datasets[0].data[1] = newTrainEmission;
	emissionChart.update();
	
	// Update trees visualization.
	visualizeTrees(newCarEmission, newTrainEmission);
}


/* Visualize how many trees are needed to absorb the CO2. */
function visualizeTrees(carEmission, trainEmission) {
	// A tree absorbs 48 pounds (21,7 k) of CO2 per year.
	// Source: NC State University (https://www.ncsu.edu/project/treesofstrength/treefact.htm).
	var kgAbsorbtion = 21.7724338;
	
	// Calculate the no. of trees needed for the train emission.
	carTrees = (carEmission/1000) / kgAbsorbtion;
	trainTrees = (trainEmission/1000) / kgAbsorbtion;
	
	// Add the trees to the DOM.
	addTrees('car', carTrees);
	addTrees('train', trainTrees);	
}

/* Adds the 'amountOfTrees' to the DOM. */
function addTrees(type, amountOfTrees) {
	// Determine how many full trees there are, and what te remainder is (e.g. 26.23 --> 26 & 0.23).
	fullTrees = Math.floor(amountOfTrees);	
	remainder = amountOfTrees % Math.floor(amountOfTrees);
	
	// Create 'fullTrees' number of fullTrees and 'remainder' part of the partial tree (width of full tree is 30 px).
	var treesHTML = '<div class="treeContainer"><img src="images/tree.png" /></div>'.repeat(fullTrees) +
		'<div class="treeContainer" style="width: ' + 30 * remainder + 'px;"><img src="images/tree.png" /></div>';
	
	// Add tree text and symbols to DOM.
	$('#trees_' + type + '_text').html(amountOfTrees.toFixed(2));
	$('#trees_' + type + '_visualization').html(treesHTML);
	
}

function regionChart() {
	var geocoder = new google.maps.Geocoder;
	
	var latlng = { lat: carJourney.end_location.lat(), lng: carJourney.end_location.lng() };
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			if (results[1]) {
				regionName = results[1].address_components[1].long_name;
				
				drawChart(new Array(regionName));
				
			} else {
				window.alert('No results found');
			}
		} else {
			window.alert('Geocoder failed due to: ' + status);
		}
	});
}


/* Called when value is added/removed from region chart. */
function changeRegionChart(regionNames) {
	// Fade out the region chart, empty it and fill it again.
	$('#regionChart').fadeTo('slow', 0.0, function() {
		$('#regionChart').html('');
		drawChart(regionNames);
	});
}


/* Draws a region chart with the regionNames's emission values. */
function drawChart(regionNames) {

	// Based on the example at http://bl.ocks.org/kramer/4745936.
	var margin = { top: 50, right: 150, bottom: 50, left: 75 },
		width = 650 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	// Create variable to parse the date.
	var parseDate = d3.time.format('%Y%m%d').parse;

	// Set up x and y axis.
	var x = d3.time.scale()
		.range([0, width]);

	var xAxis = d3.svg.axis()
		.scale(x)
		.orient('bottom');

	var y = d3.scale.linear()
		.range([height, 0]);

	var yAxis = d3.svg.axis()
		.scale(y)
		.orient('left');
		
	// Create a color scale (useful when comparing regions).
	var color = d3.scale.category10();

	// Set up line.
	var line = d3.svg.line()
		.interpolate('basis')
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.emission); });

	// Add line chart to the div container.
	var svg = d3.select('#regionChart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	// Read emission data from CSV file.
	d3.csv('data/co2_uitstoot.csv', function(error, data) {
		if (error) throw error;

		// Find all data values that are not the year (date), and that are of the user-specified regionName(s).
		color.domain(d3.keys(data[0]).filter(function(key) { return (key !== 'date') && ($.inArray(key, regionNames) !== -1); }));

		// Parse all years.
		data.forEach(function(d) {
			d.date = parseDate(d.date);
		});
		
		// Create an array map for all regions we've found.
		var regions = color.domain().map(function(name) {
			return {
				// Find the region name and all emission values associated with this region.
				name: name,
				values: data.map(function(d) {
					return {date: d.date, emission: +d[name]};
				})
			};
		});

		// X's domain is the range of all dates.
		x.domain(d3.extent(data, function(d) { return d.date; }));

		// Y's domain is 0 to the highest value.
		y.domain([
			0, d3.max(regions, function(c) { return d3.max(c.values, function(v) { return v.emission; }); })
		]);
		
		// Draw chart title.
		svg.append('text')
			.attr('x', (width / 2))             
			.attr('y', 0 - (margin.top / 2))
			.attr('class', 'chartTitle')
			.text('CO2-uitstoot verkeer en vervoer (excl. railverkeer), per gemeente');
		
		// Add legend.
		var legend = svg.selectAll('g')
			.data(regions)
			.enter()
			.append('g')
			.attr('class', 'legend');

		// Add region rectangle.
		legend.append('rect')
			.attr('x', width + margin.right - 100)
			.attr('y', function(d, i){ return i *  20;})
			.attr('width', 10)
			.attr('height', 10)
			.style('fill', function(d) { 
				return color(d.name);
			});

		// Add region name.
		legend.append('text')
			.attr('x', width + margin.right - 80)
			.attr('y', function(d, i){ return (i *  20) + 9;})
			.on('click', function(d){
				// Create a new array that excludes the current place name.
				var newRegionNames = jQuery.grep(regionNames, function(value) {
										return value != d.name;
									 });
				changeChart(newRegionNames);
			})
			.text(function(d){ return d.name; });
	
		// Add the x axis.
		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis)
			.append('text')
			.attr('transform', 'translate(' + (width / 2) + " ," + (margin.bottom-5) + ')')
			.attr('class', 'axisLabel')
			.style('text-anchor', 'middle')
			.text('Tijdstip (in jaren)');

		// Add the y axis.
		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'translate(' + (margin.bottom-110) + " ," + (height/2) + ') rotate(-90)')
			.attr('class', 'axisLabel')
			.style('text-anchor', 'middle')
			.text('CO2-uitstoot (in tonnen)');

		// Add the region's line.
		var region = svg.selectAll('.region')
			.data(regions)
			.enter().append('g')
			.attr('class', 'region');
		
		region.append('path')
			.attr('class', 'line')
			.attr('d', function(d) { return line(d.values); })
			.attr('id', function(d) { return 'line_' + (d.name) } )
			.style('stroke', function(d) { return color(d.name); });

		// Fade in region chart.
		$('#regionChart').fadeTo('slow', 1);
	});
}