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