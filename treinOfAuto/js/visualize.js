/*
VISUALIZE.JS
Contains all code for the visualizations.
*/


var amountOfJourneys = 1,
	journeyFrequency = 'jaar',
	amountOfPersons = 1,
	defaultBarOptions = {},
	running = false,
	emissionChart,
	chartRegionNames,
	lineChartTooltip;


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


var Visualize = {

	/* Draws the initial states of all visualizations to the DOM. */
	initialize: function(journey, userCar) {
		
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
							fontSize: 10
						},
						scaleLabel: {
							display: true,
							fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
							fontStyle: 'bold',
							fontSize: 10
						}
					}],
				xAxes: [{
						ticks:{
							fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
							fontSize: 10
						},
						scaleLabel: {
							display: true,
							fontFamily: "Lato,'Helvetica Neue',Arial,Helvetica,sans-serif",
							fontStyle: 'bold',
							fontSize: 10
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
		
		
		// Draw bar charts for gas price and duration.
		var priceChartOptions = {
			title: 'Prijs autoreis vs. treinreis (2e klas)',
			yLabel: "Prijs (in euro's)",
			tooltipLabel: 'Prijs reis',
			tooltipSuffix: '€',
			tooltipDecimals: 2
		};
		this.drawSimpleBarChart('priceChart', [journey.car.price, journey.train.price], defaultBarOptions, priceChartOptions);
		
		var durationChartOptions = {
			title: 'Reisduur autoreis vs. treinreis',
			yLabel: 'Reisduur (in minuten)',
			tooltipLabel: 'Reisduur',
			tooltipSuffix: 'minuten',
			tooltipDecimals: 0
		};		
		this.drawSimpleBarChart('durationChart', [parseInt(journey.car.duration.value/60, 10), parseInt(journey.train.duration.value/60, 10)], defaultBarOptions, durationChartOptions);

		// Draw bar chart comparing gas prices per gas station.
		this.drawGasStationsChart(journey.car.distance.total, userCar);
		
		// Draw emission chart and trees visualization.
		var emissionChartOptions = {
			title: 'Jaarlijkse CO2-uitstoot (per persoon) autoreis vs. treinreis *',
			yLabel: 'CO2-uitstoot per persoon per jaar (gram)',
			tooltipLabel: 'CO2-uitstoot',
			tooltipSuffix: 'gram',
			tooltipDecimals: 0
		};
		emissionChart = this.drawSimpleBarChart('emissionChart', [journey.car.emission, journey.train.emission], defaultBarOptions, emissionChartOptions);
		this.visualizeTrees(journey.car.emission, journey.train.emission);
		
		// Draw region map and corresponding chart.
		this.regionMap();
		this.regionChart();
		
		Result.removeLoadingScreen();
	},


	/* Draws a simple bar chart, with only a 'Car' and a 'Train' bar (avoids code repetition). */
	drawSimpleBarChart: function(chartID, dataValues, defaultOptions, customOptions) {
		
		var chartData = {
			labels: ['Auto', 'Trein'],
			datasets: [{
				label: customOptions.tooltipLabel,
				// Verified color-blind friendly colors: http://colorbrewer2.org/.
				backgroundColor: ['rgba(239, 138, 98, 0.9)', 'rgba(103, 169, 207, 0.9)'],
				data: dataValues
			}]
		};
		
		// Options specific to this chart (in addition to the defaultBarOptions).
		var chartOptions = {
			tooltips: {
				callbacks: {
					label: function(tooltipItem, data) {
						return tooltipItem.xLabel + ': ' + Visualize.thousandsSeparators((tooltipItem.yLabel).toFixed(customOptions.tooltipDecimals).toString().replace(/\./g, ',')) + ' ' + customOptions.tooltipSuffix;
					}
				}
			},
			scales:{
				yAxes:[{
						ticks:{
							beginAtZero: true,
							callback: function(value) {
								return Visualize.thousandsSeparators(value);
							}
						},
						scaleLabel: {
							labelString: customOptions.yLabel
						}
					}],
				xAxes:[{
						scaleLabel: {
							labelString: 'Vervoertype'
						}
					}]
			},
			title: {
				text: customOptions.title
			}
		};
		
		// Draw bar chart on canvas.
		var ctxChart = document.getElementById(chartID).getContext('2d');
		return new Chart(ctxChart, {
			type: 'bar',
			data: chartData,
			options: $.extend(true, defaultBarOptions, chartOptions)
		});
	},


	/* Draws a more complex bar chart, comparing the gas prices at the different stations. */
	drawGasStationsChart: function(distance, userCar) {
		
		var data = [];

		// Convert object to list with nested arrays (e.g. 'bp: 15.24' to '{ gasStation: bp, price: 15.24 }')
		$.each(gasArray, function(key, value) {
			// Exclude the average price from the bar chart.
			if (key !== 'average') {
				data.push({'gasStation': key, 'price': Car.calculateGasPrice(distance, value, userCar) });
			}
		});
		
		// Based on the Simple Bar Chart from Mike Bostock: http://bl.ocks.org/mbostock/3885304.
		var margin = {top: 25, right: 0, bottom: 70, left: 70},
			width = 400 - margin.left - margin.right,
			height = 300 - margin.top - margin.bottom;
			
		var formatEuro = locale.numberFormat(',.2f');
		
		// Space between the zig-zag lines.
		var axisBreakSpace = 30;

		var x = d3.scale.ordinal()
			.rangeRoundBands([0, width], 0.1);

		// Horizontal 'average' line.
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
				return '<span class="attr">Prijs ' + d.gasStation.toUpperCase() + ':</span> <span class="value">&#8364;' + formatEuro(d.price) + '</span>';
			});

		var svg = d3.select('#gasPricesChart').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

		svg.call(tooltip);	
		
		// Get the prices of all gas stations.
		data.forEach(function(d) {
			d.price = +d.price;
		});
		
		// Calculate lower and upper bound for Y axis: use (highest price/200) for both top and bottom margin.
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
			.text('Benzinekosten reis per benzinestation');
		
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
			.text('Prijs reis (in euro\'s, voor ' + gasType + ')');
		
		// Add zig-zag line to Y axis (credits to http://stackoverflow.com/questions/34811041/d3-js-zig-zag-line-on-y-axis-between-zero-and-start-value/34889500).
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
			.attr('dx', width/2)
			.attr('dy', -6)
			.append('textPath')
			.attr('xlink:href', '#averageLine')
			.attr('class', 'averageLineLabel')
			.text('Gemiddeld: €' + formatEuro((priceTotal/data.length).toFixed(2)));

	},

	
	// Adds thousands separators to a number; credits to http://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript.
	thousandsSeparators: function(number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	},


	/* Updates the emission stats after the user changes a statistic. */
	updateEmission: function() {
		var amountOfJourneysYear = amountOfJourneys;
		
		// Make sure the 'amountOfJourneys' is set per year.
		if (journeyFrequency == 'week') {
			amountOfJourneysYear = amountOfJourneys * 52;
		} else if (journeyFrequency == 'maand') {
			amountOfJourneysYear = amountOfJourneys * 12;
		}
		
		// Use singular or plural form, depending on the number of journeys.
		if (amountOfJourneys > 1) {
			$('.reisreizen').html('reizen');
		} else {
			$('.reisreizen').html('reis');		
		}
		
		// Calculate new emission numbers.
		var newCarEmission = parseInt((journey.car.emission/amountOfPersons)*amountOfJourneysYear, 10);
		var newTrainEmission = parseInt(journey.train.emission*amountOfJourneysYear, 10);
		
		// Update statistics on DOM.
		emissionWinner = Result.findWinner(newCarEmission, newTrainEmission, 'emission');
		Result.setElement('emission_winner', emissionWinner);
		Result.setElement('emission_car', this.thousandsSeparators(newCarEmission));
		Result.setElement('emission_train', this.thousandsSeparators(newTrainEmission));
		
		// Update chart.
		emissionChart.data.datasets[0].data[0] = newCarEmission;
		emissionChart.data.datasets[0].data[1] = newTrainEmission;
		emissionChart.update();
		
		// Update trees visualization.
		this.visualizeTrees(newCarEmission, newTrainEmission);
	},


	/* Visualizes how many trees are needed to absorb the CO2. */
	visualizeTrees: function(carEmission, trainEmission) {
		// A tree absorbs 48 pounds (21,7 k) of CO2 per year.
		// Source: NC State University (https://www.ncsu.edu/project/treesofstrength/treefact.htm).
		var kgAbsorbtion = 21.7724338;
		
		// Calculate the no. of trees needed for the train emission.
		carTrees = (carEmission/1000) / kgAbsorbtion;
		trainTrees = (trainEmission/1000) / kgAbsorbtion;
		
		// Add the trees to the DOM.
		this.addTrees('car', carTrees);
		this.addTrees('train', trainTrees);	
	},

	
	/* Adds the 'amountOfTrees' to the DOM. */
	addTrees: function(type, amountOfTrees) {
		// If 'amountOfTrees' is less than one, show 'amountOfTrees' part of one single tree.
		if (amountOfTrees < 1) {
			var treesHTML = '<div class="treeContainer" style="width: ' + 30 * amountOfTrees + 'px;"><img src="images/tree.png" /></div>';
		// If 'amountOfTrees' is more than one.
		} else {			
			// Determine how many full trees there are, and what te remainder is (e.g. 26.23 --> 26 & 0.23).
			fullTrees = Math.floor(amountOfTrees);	
			remainder = amountOfTrees % Math.floor(amountOfTrees);
			
			// Create 'fullTrees' number of fullTrees and 'remainder' part of the partial tree (width of full tree is 30 px).
			var treesHTML = '<div class="treeContainer"><img src="images/tree.png" /></div>'.repeat(fullTrees) +
				'<div class="treeContainer" style="width: ' + 30 * remainder + 'px;"><img src="images/tree.png" /></div>';
		}	
		
		// Add tree text and symbols to DOM.
		$('#trees_' + type + '_text').html(amountOfTrees.toFixed(2).toString().replace(/\./g, ','));
		$('#trees_' + type + '_visualization').html(treesHTML);
	},


	/* Calls the functions necessary to draw the region chart. */
	regionChart: function() {
		// Find region ("gemeente") of start location.
		GoogleMaps.findRegion({ lat: carJourney.start_location.lat(), lng: carJourney.start_location.lng() }, []).done(function(regions) {
			// Find region ("gemeente") of end location.
			GoogleMaps.findRegion({ lat: carJourney.end_location.lat(), lng: carJourney.end_location.lng() }, regions).done(function(regions) {
				chartRegionNames = regions;
				
				// Loop over the region names and make them active in the region map.
				for (var i = 0, l = chartRegionNames.length; i < l; i++) {
					$('#' + chartRegionNames[i].replace(/ /g, '_')).attr('class', 'regionOverlay active');
				}
				
				// Draw the region chart.
				Visualize.drawRegionChart();
			});
		});
	},


	


	/* Called when value is added/removed from region chart. */
	changeRegionChart: function(regionName) {
		// Don't run this function multiple times at the same moment (prevent
		// strange behavior when user goes crazy-clicking regions).
		if (!running) {
			running = true;
			
			// If region name is currently in array of chart region names, remove it.
			if ($.inArray(regionName, chartRegionNames) !== -1) {
				chartRegionNames.splice( $.inArray(regionName, chartRegionNames), 1 );
				$('#' + regionName.replace(/ /g, '_')).attr('class', 'regionOverlay');
			// If region name isn't in array of chart region names, add it.
			} else {
				chartRegionNames.push(regionName);
				$('#' + regionName.replace(/ /g, '_')).attr('class', 'regionOverlay active');
			}
			
			// Draw region chart using new chartRegionNames.
			$('#regionChart').fadeTo('fast', 0.0, function() {
				$('#regionChart').html('');
				Visualize.drawRegionChart();
			});
			
			running = false;
		}
	},


	/* Draws a region chart with the emission values of the regions in 'chartRegionNames'. */
	drawRegionChart: function() {

		// Based on the example at http://bl.ocks.org/kramer/4745936.
		var margin = { top: 50, right: 160, bottom: 50, left: 95 },
			width = 650 - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;
		
		var format = locale.numberFormat(',.');
		
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
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.emission); });

		// Add line chart to the div container.
		var svg = d3.select('#regionChart').append('svg')
			.attr('width', width + margin.left + margin.right)
			.attr('height', height + margin.top + margin.bottom)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		
		// Set up tooltip.
		var tooltip = d3.tip()
			.attr('class', 'tooltip')
			.offset([-10, 0])
			.html(function (d) {
				return lineChartTooltip;
			});

		svg.call(tooltip);
		
		// Read emission data from CSV file.
		d3.csv('data/co2_uitstoot.csv', function(error, data) {
			if (error) throw error;

			// Find all data values that are not the year (date), and that are of the user-specified regionName(s).
			color.domain(d3.keys(data[0]).filter(function(key) { return (key !== 'date') && ($.inArray(key, chartRegionNames) !== -1); }));

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
			
			// If user removed all regions from chart, don't draw an empty chart, but show a message (error handling).
			if (regions.length < 1) {
				$('#regionChart').fadeTo('fast', 1);
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
				.attr('x', width + margin.right - 150)
				.attr('y', function(d, i){ return i * 20;})
				.attr('width', 10)
				.attr('height', 10)
				.attr('class', 'chartLegendItemBox')
				.style('fill', function(d) { 
					return color(d.name);
				});

			// Add region name.
			legend.append('text')
				.attr('x', width + margin.right - 130)
				.attr('y', function(d, i){ return (i * 20) + 9;})
				.attr('class', 'chartLegendItemText')
				// When user clicks legend item, remove it from the chart.
				.on('click', function(d){
					Visualize.changeRegionChart(d.name);
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
				.attr('transform', 'translate(' + (-margin.left+15) + ' ,' + (height/2) + ') rotate(-90)')
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
				.attr('id', function(d) { return 'line_' + (d.name); } )
				.style('stroke', function(d) { return color(d.name); });

			// Add tooltip.
			region.selectAll('.circle')
				.data( function(d) { return(d.values); } )
				.enter()
				.append('svg:circle')
				.attr('class', 'circle')
				.attr('cx', function (d, i) {
					return x(d.date);
				})
				.attr('cy', function (d, i) {
					return y(d.emission);
				})
				.attr('r', 5)
				.on('mouseover', function(d) {
					var circles = d3.selectAll("circle")[0];
					var emissionArray = [];
					
					// Loop over all tooltip circles.
					for (var i = 0; i < circles.length; i++) {
						// If the tooltip circle is at the same x position as the current one, it
						// represents the same year. Save its emission value in 'emissionArray'.
						if (circles[i].attributes.cx.value == x(d.date)) {
							var year = (circles[i].__data__.date).getFullYear();
							emissionArray.push(circles[i].__data__.emission);
						}
					}
					
					// Initialize the tooltip text with a title.
					lineChartTooltip = '<strong>Uitstoot ' + year + '</strong>';
					
					var legendItemBoxes = d3.selectAll(".chartLegendItemBox")[0];
					var styleArray = [];
					
					// Loop over all legend boxes and extract their style.
					for (i = 0; i < legendItemBoxes.length; i++) {
						var style = legendItemBoxes[i].attributes.style.value;
						// Replace 'fill' by 'color', because text has no fill, but a color.
						styleArray.push(style.replace('fill', 'color'));
					}
					
					var legendItemTexts = d3.selectAll(".chartLegendItemText")[0];
					
					// Loop over all legend labels and extract the label text.
					for (i = 0; i < legendItemTexts.length; i++) {
						var regionName = legendItemTexts[i].innerHTML;
						
						// Add the region's name and value to the tooltip, and give it the same
						// color as the box (and therefore the line).
						lineChartTooltip = lineChartTooltip + '<br><span style="' + styleArray[i] + '">' + regionName + ' - ' + format(emissionArray[i]) + ' ton</span>';
					}
					
					// Show the tooltip.
					tooltip.show(d);
				})
				.on('mouseout', tooltip.hide);
			
			// Fade in region chart.
			$('#regionChart').fadeTo('fast', 1);
		});
	},


	/* Creates a map of The Netherlands with the emission values of all regions ("gemeentes"). */
	regionMap: function() {
		
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
				});

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
					Visualize.changeRegionChart(d.properties.gemeenteNaam);
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
					Visualize.changeRegionChart(d.properties.gemeenteNaam);
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
					// Use Math.ceil to round class boundaries to highest thousand.
					return format(Math.ceil((+extent[0])/1000)*1000) + ' - ' + format(Math.ceil((+extent[1])/1000)*1000) + ' ton';
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
};