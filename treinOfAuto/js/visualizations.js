/*
VISUALIZATIONS.JS
Contains all codes for the visualizations.
*/

var amountOfJourneys = 1,
	journeyFrequency = 'jaar',
	amountOfPersons = 1,
	defaultBarOptions = {},
	running = false,
	emissionChart,
	regionNames;

// I've created a Dutch D3 locale to correctly format my numbers.
var locale = d3.locale({
	'decimal': ',',
	'thousands': '.',
	'grouping': [3],
	'currency': ['€', ''],
	'dateTime': '%A, %e %B %Y г. %X',
	'date': '%d-%m-%Y',
	'time': '%H:%M:%S',
	'periods': ['AM', 'PM'],
	'days': ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'],
	'shortDays': ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
	'months': ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
	'shortMonths': ['Jan', 'Feb', 'Maa', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
});

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
	
	
	drawSimpleBarChart('priceChart', 'Prijs autoreis vs. treinreis', "Prijs (in euro's)", 'Prijs reis', '€', 2, [journey.car.price, journey.train.price], defaultBarOptions);
	drawSimpleBarChart('durationChart', 'Reisduur autoreis vs. treinreis', 'Reisduur (in minuten)', 'Reisduur', 'minuten', 0, [parseInt(journey.car.duration.value/60), parseInt(journey.train.duration.value/60)], defaultBarOptions);

	drawGasStationsChart(journey.car.distance.total, userCar);
	
	emissionChart = drawSimpleBarChart('emissionChart', 'Jaarlijkse CO2-uitstoot (per persoon) autoreis vs. treinreis *', 'CO2-uitstoot per persoon per jaar (gram)', 'CO2-uitstoot', 'gram', 0, [journey.car.emission, journey.train.emission], defaultBarOptions);
	visualizeTrees(journey.car.emission, journey.train.emission);
	
	regionMap();
	regionChart();
	
	removeLoadingScreen();
}


/* Draws a simple bar chart, with only a 'Car' and a 'Train' bar (avoids code repetition). */
function drawSimpleBarChart(chartID, title, yLabel, tooltipLabel, tooltipSuffix, tooltipDecimals, chartData, defaultBarOptions) {
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
					return tooltipItem.xLabel + ': ' + thousandsSeparators((tooltipItem.yLabel).toFixed(tooltipDecimals).toString().replace(/\./g, ',')) + ' ' + tooltipSuffix;
				}
			}
		},
		scales:{
			yAxes:[{
					ticks:{
						beginAtZero: true,
						callback: function(value) {
							return thousandsSeparators(value);
						}
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

	var margin = {top: 25, right: 0, bottom: 70, left: 70},
		width = 400 - margin.left - margin.right,
		height = 300 - margin.top - margin.bottom;
		
	var formatEuro = locale.numberFormat(',.2f');
	
	var axisBreakSpace = 30;

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
			return '<span class="attr">Prijs ' + d.gasStation + ':</span> <span class="value">&#8364;' + formatEuro(d.price) + '</span>';
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
		.attr('transform', 'translate(0,' + (height + axisBreakSpace) + ')')
		.call(xAxis)
		.append('text')
		.attr('transform', 'translate(' + (width / 2) + " ," + (margin.bottom / 2) + ')')
		.attr('class', 'axisLabel')
        .style('text-anchor', 'middle')
		.text('Benzinestation');

	// Draw Y axis.
	var yG = svg.append('g')
		.attr('class', 'y axis')
		.call(yAxis);
	
	// Draw Y axis label.
	yG.append('text')
		.attr('transform', 'rotate(-90)')
		.attr('y', 6)
		.attr('dy', '-5em')
		.attr('class', 'axisLabel')
		.text('Prijs ' + gasType + ' (in euro\'s)');
	
	// Add zig-zag line to Y axis (credits to http://stackoverflow.com/questions/34811041/d3-js-zig-zag-line-on-y-axis-between-zero-and-start-value/34889500#34889500).
	yG.append('path')
		.attr('d', function(){
			// Define the number of zig-zags and calculate the distance between each zig-zag.
			var numZags = 4,
				zagDist = (axisBreakSpace - 5) / numZags;

			// Calculate the dimensions of the zig-zag.
			var curZig = height,
				d = 'M0,' + curZig;
			
			// Add all zig-zags to the DOM.
			for (var i = 0; i < numZags; i++){
				curZig += zagDist;
				d += (i % 2 === 0) ? ' L10,' + curZig : ' L-10,' + curZig;
			}
			
			d += ' L0,' + (height + axisBreakSpace);
			
			return d;
		});

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
		.attr('class', 'averageLine')
		.attr('d', averageLine)
		.attr('id', 'averageLine');
		
	// Add a label to the average price line.
	svg.append('text')
		.attr('x', width/2)
		.attr('dy', -6)
		.append('textPath')
		.attr('xlink:href', '#averageLine')
		.attr('class', 'averageLineLabel')
		.text('Gemiddeld: €' + formatEuro((priceTotal/data.length).toFixed(2)));

}

// Adds thousands separators to a number; credits to http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript.
function thousandsSeparators(number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
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
	
	// Use singular or plural form, depending on the number of journeys.
	if (amountOfJourneys > 1) {
		$('.reisreizen').html('reizen');
	}
	else {
		$('.reisreizen').html('reis');		
	}
	
	// Calculate new emission numbers.
	var newCarEmission = parseInt((journey.car.emission/amountOfPersons)*amountOfJourneysYear);
	var newTrainEmission = parseInt(journey.train.emission*amountOfJourneysYear);
	
	// Update statistics on DOM.
	emissionWinner = findWinner(newCarEmission, newTrainEmission, 'emission');
	setElement('emission_winner', emissionWinner);
	setElement('emission_car', thousandsSeparators(newCarEmission));
	setElement('emission_train', thousandsSeparators(newTrainEmission));
	
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
	$('#trees_' + type + '_text').html(amountOfTrees.toFixed(2).toString().replace(/\./g, ','));
	$('#trees_' + type + '_visualization').html(treesHTML);
	
}


/* Calls the functions necessary to draw the region chart. */
function regionChart() {
	// Find region ("gemeente") of start location.
	findRegion({ lat: carJourney.start_location.lat(), lng: carJourney.start_location.lng() }, new Array()).done(function(regions) {
		// Find region ("gemeente") of end location.
		findRegion({ lat: carJourney.end_location.lat(), lng: carJourney.end_location.lng() }, regions).done(function(regions) {
			regionNames = regions;
			
			// Loop over the region names and make them active in the region map.
			for (var i = 0, l = regionNames.length; i < l; i++) {
				$('#' + regionNames[i].replace(/ /g, '_')).attr('class', 'regionOverlay active');
			}
			
			// Draw the region chart.
			drawRegionChart();
		});
	});
}


/* Finds the region ("gemeente") corresponding to the lat/lang coordinates. */
function findRegion(latlng, regions) {
	
	var dfd = $.Deferred();
	
	var geocoder = new google.maps.Geocoder;

	// Create a geocoder request for the lat/lang coordinates.
	geocoder.geocode({'location': latlng}, function(results, status) {
		if (status === google.maps.GeocoderStatus.OK) {
			// If we found results, return the region name.
			if (results[1]) {
				// Sometimes the region name is in the second element, sometimes in the third.
				// Push both to be sure.
				regions.push(results[1].address_components[1].long_name);
				regions.push(results[1].address_components[2].long_name);
				
				dfd.resolve(regions);
			
			// These errors are logged to the console, because they are not directly relevant to the user.
			} else {
				console.log('Geocoder kon de gemeente van de volgende bestemming niet vinden: ' + latlng)
			}
		} else {
			console.log('Foutmelding Geocoder: ' + status);
		}
	});
	
	return dfd.promise();
}


/* Called when value is added/removed from region chart. */
function changeRegionChart(regionName) {
	// Only add/remove region when this function isn't currently running (prevent
	// strange behavior when user goes crazy-clicking regions).
	if (!running) {
		
		running = true;
		
		// If region name is currently in array of chart region names, remove it.
		if ($.inArray(regionName, regionNames) !== -1) {
			regionNames.splice( $.inArray(regionName, regionNames), 1 );
			$('#' + regionName.replace(/ /g, '_')).attr('class', 'regionOverlay');
		}
		// If region name isn't in array of chart region names, add it.
		else {
			regionNames.push(regionName);
			$('#' + regionName.replace(/ /g, '_')).attr('class', 'regionOverlay active');
		}
		
		// Draw region chart using new chartRegionNames.
		$('#regionChart').fadeTo('fast', 0.0, function() {
			$('#regionChart').html('');
			drawRegionChart();
		});
		
		running = false;
	}
}


/* Draws a region chart with the regionNames's emission values. */
function drawRegionChart() {

	// Based on the example at http://bl.ocks.org/kramer/4745936.
	var margin = { top: 50, right: 150, bottom: 50, left: 95 },
		width = 650 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;
	
	var format = locale.numberFormat(',.');
	
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
		.orient('left')
		.tickFormat(format);
		
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
		
		// If user removed all regions from chart, don't draw an empty chart, but show an error (error handling).
		if (regions.length < 1) {
			$('#regionChart').fadeTo('fast', 1)
			$('#regionChart').html('Selecteer a.u.b. een gemeente op de kaart hierboven.');
			return;
		}

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
			.attr('x', width + margin.right - 120)
			.attr('y', function(d, i){ return i *  20;})
			.attr('width', 10)
			.attr('height', 10)
			.style('fill', function(d) { 
				return color(d.name);
			});

		// Add region name.
		legend.append('text')
			.attr('x', width + margin.right - 100)
			.attr('y', function(d, i){ return (i *  20) + 9;})
			.attr('class', 'chartLegendItem')
			// When user clicks legend item, remove it from the chart.
			.on('click', function(d){
				changeRegionChart(d.name);
			})
			.text(function(d){ return d.name; });
	
		// Add the x axis.
		svg.append('g')
			.attr('class', 'x axis')
			.attr('transform', 'translate(0,' + height + ')')
			.call(xAxis)
			.append('text')
			.attr('transform', 'translate(' + (width / 2) + ' ,' + (margin.bottom-5) + ')')
			.attr('class', 'axisLabel')
			.style('text-anchor', 'middle')
			.text('Tijdstip (in jaren)');

		// Add the y axis.
		svg.append('g')
			.attr('class', 'y axis')
			.call(yAxis)
			.append('text')
			.attr('transform', 'translate(' + (margin.bottom-110) + ' ,' + (height/2) + ') rotate(-90)')
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

		// Credits to http://stackoverflow.com/questions/34886070/d3-js-multiseries-line-chart-with-mouseover-tooltip/34887578#34887578 for the tooltip script below.
		var mouseG = svg.append('g')
			.attr('class', 'mouse-over-effects');

		// Add vertical mouse line.
		mouseG.append('path')
			.attr('class', 'mouse-line')
			.style('stroke', 'black')
			.style('stroke-width', '1px')
			.style('opacity', '0');

		// Get all lines in  the chart.
		var lines = document.getElementsByClassName('line');

		var mousePerLine = mouseG.selectAll('.mouse-per-line')
			.data(regions)
			.enter()
			.append('g')
			.attr('class', 'mouse-per-line');

		mousePerLine.append('circle')
			.attr('r', 7)
			.style('stroke', function(d) {
				return color(d.name);
			})
			.style('fill', 'none')
			.style('stroke-width', '1px')
			.style('opacity', '0');

		mousePerLine.append('text')
			.attr('transform', 'translate(10,3)');

		// Add rectangle that tracks mouse movements on canvas.
		mouseG.append('svg:rect')
			.attr('width', width)
			.attr('height', height)
			.attr('fill', 'none')
			.attr('pointer-events', 'all')
			// When mouse leaves canvas, hide line, circles and tooltip text.
			.on('mouseout', function() {
				d3.select('.mouse-line')
				.style('opacity', '0');
				d3.selectAll('.mouse-per-line circle')
				.style('opacity', '0');
				d3.selectAll('.mouse-per-line text')
				.style('opacity', '0');
			})
			// When mouse enters canvas, add line, circles and tooltip text.
			.on('mouseover', function() {
				d3.select('.mouse-line')
				.style('opacity', '1');
				d3.selectAll('.mouse-per-line circle')
				.style('opacity', '1');
				d3.selectAll('.mouse-per-line text')
				.style('opacity', '1');
			})
			// When mouse moves, update line, circles and tooltip text.
			.on('mousemove', function() {
				var mouse = d3.mouse(this);
				d3.select('.mouse-line')
				.attr('d', function() {
					var d = 'M' + mouse[0] + ',' + height;
					d += ' ' + mouse[0] + ',' + 0;
					return d;
				});

			
			// Position the tooltip's circle and tooltip text.
			d3.selectAll('.mouse-per-line')
				.attr('transform', function(d, i) {
					// Extract date.
					var xDate = x.invert(mouse[0]),
					bisect = d3.bisector(function(d) { return d.date; }).right;
					idx = bisect(d.values, xDate);

					var beginning = 0,
					end = lines[i].getTotalLength(),
					target = null;

					// Find the position of the line.
					while (true){
						target = Math.floor((beginning + end) / 2);
						pos = lines[i].getPointAtLength(target);
						
						// Stop if position is found.
						if ((target === end || target === beginning) && pos.x !== mouse[0]) {
							break;
						}
						
						// Match te line and mouse position.
						if (pos.x > mouse[0])		end = target;
						else if (pos.x < mouse[0])	beginning = target;
						// We found the position.
						else						break;
					}

					// Add tooltip to line.
					d3.select(this).select('text')
						.text(parseInt(y.invert(pos.y)));

					// Return the position.
					return 'translate(' + mouse[0] + ',' + pos.y +')';
				});
		});
		
		// Fade in region chart.
		$('#regionChart').fadeTo('fast', 1)
	});
}


/* Creates a map of The Netherlands with the emission for all regions ("gemeentes"). */
function regionMap() {
	
	// Based on http://bl.ocks.org/mbostock/8ca036b3505121279daf.
	
	// Create map and set up its dimensions.
	var regionMap = d3.map();
	var format = locale.numberFormat(',.');

	var width = 600,
		height = 600;

	// Divide the data into eight quantiles.
	var quantile = d3.scale.quantile()
		.range(d3.range(8).map(function(i) { return 'region q' + i + '-8'; }));

	// Set up how the map should be displayed.
	var projection = d3.geo.mercator()
		.center([5.3, 52.2])
		.scale([7000])
		.translate([width/2, height/2]);

	var path = d3.geo.path().projection(projection);

	// Add the map to the DOM.
	var svg = d3.select('#regionMap').append('svg')
		.attr('width', width)
		.attr('height', height);

	// Read the TopoJSON file with the regions and the CSV file with the emission values.
	queue()
		.defer(d3.json, 'data/gemeentes2016.json')
		.defer(d3.csv, 'data/co2_uitstoot_id.csv', function(d) { regionMap.set(d.id, +d[2013]); })
		.await(ready);

	// When all data is loaded...
	function ready(error, shape) {
		if (error) throw error;

		// Set up the quantile domain with the values.
		quantile.domain(regionMap.values());
		
		// Tooltip.
		var tooltip = d3.tip()
			.attr('class', 'tooltip')
			.offset([-10, 0])
			.html(function(d) {
				return '<span class="attr">Uitstoot ' + d.properties.gemeenteNaam + ':</span> <span class="value">' + format(regionMap.get(d.properties.gemeenteID)) + ' ton</span>';
			})


		svg.call(tooltip);
		
		// Add The Netherlands to the map.
		svg.append('g')
			.attr({'transform': 'scale(1) translate(0,0)'})
			.attr('class', 'counties')
			// Add regions ("gemeentes") to map.
			.selectAll('path')
			.data(topojson.feature(shape, shape.objects.nederlandGemeenteGeo).features)
			.enter().append('path')
			.attr('class', function(d) { return quantile(regionMap.get(d.properties.gemeenteID)); })
			.attr('d', path)
			// When user clicks on region, add it to the chart.
			.on('click', function(d) {
				changeRegionChart(d.properties.gemeenteNaam);
			})
			// Add tooltip.
			.on('mouseover', tooltip.show)
			.on('mouseout', tooltip.hide);
		
		// Add each region again, but this time with the class 'overlay'.
		// This overlay will become active once the region is clicked.
		svg.append('g')
			.attr({'transform': 'scale(1) translate(0,0)'})
			.attr('class', 'counties')
			.selectAll('path')
			.data(topojson.feature(shape, shape.objects.nederlandGemeenteGeo).features)
			.enter().append('path')
			.attr('class', 'regionOverlay')
			.attr('id', function(d) {
				if (typeof d.properties.gemeenteNaam != 'undefined') {
					return (d.properties.gemeenteNaam).replace(/ /g, '_');
				}
			})
			.attr('d', path)
			// When user clicks on region, add it to the chart.
			.on('click', function(d) {
				changeRegionChart(d.properties.gemeenteNaam);
			})
			// Add tooltip.
			.on('mouseover', tooltip.show)
			.on('mouseout', tooltip.hide);
		
		// Add legend.
		var legend = svg.selectAll('g.legendEntry')
			.data(quantile.range().reverse())
			.enter()
			.append('g').attr('class', 'legendEntry');

		legend.append('rect')
			.attr('x', 20)
			.attr('y', function(d, i) {
				return 180 - i * 20;
			})
			.attr('class', function(d, i) {
				return 'legendBlock ' + d;
			})
			.attr('width', 10)
			.attr('height', 10);

		legend.append('text')
			.attr('x', 40)
			.attr('y', function(d, i) {
				return 40 + i * 20;
			})
			.attr('dy', '0.8em')
			.text(function(d,i) {
				var extent = quantile.invertExtent(d);
				return format(+extent[0]) + ' - ' + format(+extent[1]) + ' ton';
			});
		
		// Add diagonal hatch fill pattern; credits to http://stackoverflow.com/questions/17776641/fill-rect-with-pattern.
		svg.append('defs')
			.append('pattern')
			.attr('id', 'diagonalHatch')
			.attr('patternUnits', 'userSpaceOnUse')
			.attr('width', 4)
			.attr('height', 4)
			.append('path')
			.attr('d', 'M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2')
			.attr('stroke', '#000000')
			.attr('stroke-width', 1);
	}
	
}