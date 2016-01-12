/*
VISUALIZATIONS.JS
Contains all codes for the visualizations.
*/

defaultBarOptions = {}
emissionChart;

/* When 'amountOfPersons' dropdown changes, update the car emission. */
$('.item').click(function() {
	var amountOfPersons = parseInt($(this).text());
	var newEmission = parseInt(journey.car.emission/amountOfPersons);
	
	// Set new emission on DOM.
	emissionWinner = findWinner(journey.car.emission, journey.train.emission, 'emission');
	setElement('emission_winner', emissionWinner);
	setElement('emission_car', newEmission);
	
	// Update chart.
	emissionChart.data.datasets[0].data[0] = newEmission;
	emissionChart.update();
});


/* Draws the visualizations to the DOM. */
function visualize(journey, userCar, gasPrices) {
	
	// Default bar chart options.
	defaultBarOptions = {
		responsiveAnimationDuration: 1000,
		legend: {
			display: false
		},
		scales:{
			yAxes:[{
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
				}],
			xAxes:[{
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
				}]
		},
		title: {
			display: true,
			fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
			fontStyle: 'bold'
		}
	};
	
	
	drawSimpleBarChart('priceChart', 'Prijs autoreis vs. treinreis', "Prijs (in euro's)", 'Prijs reis', [journey.car.price, journey.train.price], defaultBarOptions);
	drawSimpleBarChart('durationChart', 'Reisduur autoreis vs. treinreis', 'Reisduur (in minuten)', 'Reisduur', [parseInt(journey.car.duration.value/60), parseInt(journey.train.duration.value/60)], defaultBarOptions);

	drawGasStationsChart(userCar['gasType'], gasPrices);
	
	emissionChart = drawSimpleBarChart('emissionChart', 'CO2-uitstoot autoreis vs. treinreis', 'CO2-uitstoot (g/km)', 'CO2-uitstoot', [journey.car.emission, journey.train.emission], defaultBarOptions);

}


/* Draws a simple bar chart, with only a 'Car' and a 'Train' bar (avoids code repetition). */
function drawSimpleBarChart(chartID, title, yLabel, tooltipLabel, chartData, defaultBarOptions) {
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
	var ctxChart = document.getElementById(chartID).getContext("2d");
	return new Chart(ctxChart, {
		type: 'bar',
		data: chartData,
		options: $.extend(true, defaultBarOptions, chartOptions)
	});
}


/* Draws a more complex bar chart, comparing the gas prices at the different stations. */
function drawGasStationsChart(type, gasPrices) {
	
	// Check gas type.
	if (type == 'benzine') {
		type = 'Euro 95'
		gasArray = gasPrices.benzine;
	}
	else if (type == 'diesel') {
		gasArray = gasPrices.diesel;
	}
	else if (type == 'lpg') {
		gasArray = gasPrices.lpg;
	}
	// Set to 'benzine' by default (to prevent errors).
	else {
		type = 'benzine';
		gasArray = gasPrices.benzine;
	}
	
	var data = [];
	
	// Convert object to list with nested arrays (e.g. 'bp: 1.50' to '{gasStation: bp, price: 1,50}')
	$.each(gasArray, function(key, value) {
		// Exclude the average price from the bar chart.
		if (key !== 'average') {
			data.push({'gasStation': key, 'price': value});
		}
	});
	
	// Based on the Simple Bar Chart from the D3.JS wiki: http://bl.ocks.org/mbostock/3885304.

	var margin = {top: 25, right: 0, bottom: 40, left: 70},
		width = 400 - margin.left - margin.right,
		height = 250 - margin.top - margin.bottom;
		
	var formatEuro = d3.format('.3f');

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
	yLower = d3.min(data, function(d) { return d.price-0.01; });
	yUpper = d3.max(data, function(d) { return d.price+0.01; });
	
	// Set up X domain (all gas types) and Y domain (calculated above).
	x.domain(data.map(function(d) { return d.gasStation; }));
	xAverage.domain(data.map(function(d) { return d.gasStation; }));
	y.domain([yLower, yUpper]);
	
	// Draw chart title.
	svg.append('text')
		.attr('x', (width / 2))             
		.attr('y', 0 - (margin.top / 2))
		.attr('class', 'chartTitle')
		.text('Actuele prijzen ' + type.toUpperCase() + ' per benzinestation');
	
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
		.text('Prijs ' + type + ' (in euro\'s)');

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
		.text('Gemiddeld: €' + (priceTotal/data.length).toString().replace('.', ','));

}