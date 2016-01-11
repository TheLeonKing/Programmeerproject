/*
VISUALIZATIONS.JS
Contains all codes for the visualizations.
*/


/* Draws the visualizations to the DOM. */
function visualize(journey, userCar, gasPrices) {
	
	// Default bar chart options.
	var defaultBarOptions = {
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

	drawGasStationsChart(userCar['gasType'], gasPrices, defaultBarOptions);

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
	new Chart(ctxChart, {
		type: 'bar',
		data: chartData,
		options: $.extend(true, defaultBarOptions, chartOptions)
	});
}


/* Draws a more complex bar chart, comparing the gas prices at the different stations. */
function drawGasStationsChart(type, gasPrices, defaultBarOptions) {
	
	// Check gas type.
	if (type == 'benzine') {
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
	
	// Chart data.
	var chartData = {
		labels: $.map(gasArray, function(value, key){ return key.toUpperCase(); }),
		datasets: [{
			label: 'Prijs ' + type,
			// Verified color-blind friendly colors http://colorbrewer2.org/.
			backgroundColor: 'rgba(175, 141, 195, 0.9)',
			data: $.map(gasArray, function(value){ return value; }),
		}]
	};
	
	// Options specific to this chart (in addition to the defaultBarOptions).
	var chartOptions = {
		scales:{
			yAxes:[{
					ticks:{
						beginAtZero: false,
						suggestedMin: Math.min.apply(Math, $.map(gasArray, function(value){ return value; }))-0.01,
						suggestedMax: Math.max.apply(Math, $.map(gasArray, function(value){ return value; }))+0.01,
					},
					scaleLabel: {
						labelString: 'Prijs ' + type + "(in euro's)"
					},
				}],
			xAxes:[{
					scaleLabel: {
						labelString: 'Vervoertype'
					},
				}]
		},
		title: {
			text: 'Prijzen ' + type
		}
	};
	
	// Draw chart.
	var ctxChart = document.getElementById('gasPricesChart').getContext("2d");
	var gasPricesChart = new Chart(ctxChart, {
		type: 'bar',
		data: chartData,
		options: $.extend(true, defaultBarOptions, chartOptions)
	});

}