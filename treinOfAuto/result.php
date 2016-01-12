<?php

require('classes/connect.php');
require('classes/gas.php');

// Only execute script when "from" and "to" location are set.
if (isset($_GET['from']) && isset($_GET['from']) && isset($_GET['licensePlate'])) {
	$from = $_GET['from'];
	$to = $_GET['to'];
	$licensePlate = str_replace('-', '', trim($_GET['licensePlate']));
}
else {
	die("We konden niet alle benodigde gegevens vinden. Weet u zeker dat u hier rechtstreeks via onze website bent gekomen?");
}

// Establish a database connection.				
$database = new Database();
$db = $database->connect();

// Fetch the prices from the databases.
$gas = new Gas();
$gasPrices = $gas->fetchPrices($db);

// TODO:
// - Chart that compares gas prices per station.
// - Emission chart: implement "number of travelers".
// - Error handling.
// - Custom fields for usage statistics.
// - Combined graph?
// - Bug: Schenkerven 9 naar Drunen.

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>Trein of auto: Wat is goedkoper en sneller?</title>
	
	<link rel="stylesheet" type="text/css" href="css/libs/semantic.min.css">
	<link rel="stylesheet" type="text/css" href="css/libs/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/libs/ionicons.min.css">
	<link rel="stylesheet" href="css/result.css" />
	<link rel="stylesheet" href="css/visualizations.css" />
	
	<script src="js/libs/jquery.js"></script>
	<script type='text/javascript' src="http://cdnjs.cloudflare.com/ajax/libs/jquery-ajaxtransport-xdomainrequest/1.0.1/jquery.xdomainrequest.min.js"></script>
	
	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>
<body>

	<div class="ui borderless main menu">
		<div class="ui text container">
			<div href="#" class="header item">
				<img class="logo" src="images/logo.png" style="margin-right: 10px;">
				Trein of Auto
			</div>
			<a href="#" class="item">Kosten</a>
			<a href="#" class="item">Route</a>
			<a href="#" class="item">Milieu</a>
		</div>
	</div>


	<div class="ui text container">
		
		<div class="ui center top grid">
			<!-- Price overview -->
			<div class="eight wide column">
				<h2>Goedkoper: <span id="price_winner"></span></h2>
				
				<div class="ui grid">
					<!-- Car price -->
					<div class="eight wide column" id="price_car_container">
						<h3><i class="fa fa-car"></i> <span id="price_car"></span>&#8364;</h3>
					</div>
					
					<!-- Train price -->
					<div class="eight wide column" id="price_train_container">
						<h3><i class="fa fa-train"></i> <span id="price_train"></span>&#8364;</h3>
					</div>
					
					<!-- Price chart -->
					<div class="sixteen wide column">
						<canvas id="priceChart"></canvas>
					</div>
				</div>
				
			</div>
			
			<!-- Trip length overview -->
			<div class="eight wide column">
				<h2>Sneller: <span id="duration_winner"></span></h2>
				
				<div class="ui grid">
					<!-- Car duration -->
					<div class="eight wide column" id="duration_car_container">
						<h3><i class="fa fa-car"></i> <span id="duration_car"></span></h3>
					</div>
					
					<!-- Train duration -->
					<div class="eight wide column" id="duration_train_container">
						<h3><i class="fa fa-train"></i> <span id="duration_train"></span></h3>
					</div>
					
					<!-- Duration chart -->
					<div class="sixteen wide column">
						<canvas id="durationChart"></canvas>
					</div>
				</div>
				
			</div>
		</div>
		
		<div class="ui styled accordion">
			<!-- Costs -->
			<div class="title">
				<i class="dropdown icon"></i> Kosten
			</div>
			<div class="content">
				<div id="gasPricesChart"></div>
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
			</div>
			
			<!-- Route -->
			<div class="title">
				<i class="dropdown icon"></i> Route
			</div>
			<div class="content">
				<div id="mapContainer">
					<div id="map"></div>
					<div id="legend">
						<span class="item header">LEGENDA</span>
						<span class="item car">Auto: <span id="duration_car_detail"></span></span>
						<span class="item train">Trein: <span id="duration_train_detail"></span></span>
					</div>
				</div>
				<!-- Car directions -->
				<div class="ui relaxed divided list" id="directions_car"></div>
				
				<br><br><br><br>
				
				<!-- Train directions -->
				<div class="ui relaxed divided list" id="directions_train"></div>
			</div>
			
			<!-- Environment -->
			<div class="title">
				<i class="dropdown icon"></i> Milieu
			</div>
			<div class="content">
				
				<div class="ui center grid">
					<div class="sixteen wide column">
						<h2>Milieuvriendelijker: <span id="emission_winner"></span></h2>
					</div>
					
					<!-- Car CO2 -->
					<div class="eight wide column" id="emission_car_container">
						<h3><i class="fa fa-car"></i> <span id="emission_car"></span> g/km</h3>
					</div>
					
					<!-- Train CO2 -->
					<div class="eight wide column" id="emission_train_container">
						<h3><i class="fa fa-train"></i> <span id="emission_train"></span> g/km</h3>
					</div>
					
					<!-- CO2 chart -->
					<div class="sixteen wide column">
						<div class="ui info message">Toelichting.</div>
						
						<h4 class="ui header">
							<i class="users icon"></i>
							<div class="content dropdownContent">
								Aantal personen: 
								<div class="ui inline dropdown" tabindex="0">
								<div class="text">één</div>
								<i class="dropdown icon"></i>
								<div class="menu transition hidden" tabindex="-1">
									<div class="header">Totaal reisgezelschap</div>
									<div class="item active selected" data-text="één">1</div>
									<div class="item" data-text="twee">2</div>
									<div class="item" data-text="drie">3</div>
									<div class="item" data-text="vier">4</div>
									<div class="item" data-text="vijf">5</div>
									<div class="item" data-text="zes">6</div>
								</div>
								</div>
							</div>
						</h4>
						
						<canvas id="emissionChart"></canvas>
					</div>
				</div>
			</div>
		</div>
	</div>

	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&language=nl"></script>
	<script src="js/libs/d3.min.js"></script>
	<script src="js/libs/d3.tip.min.js"></script>
	<script src="js/libs/semantic.min.js"></script>
	<script src="js/libs/moment.min.js"></script>
	<script src="js/libs/chart.min.js"></script>
	
	<script src="js/main.js"></script>
	<script src="js/car.js"></script>
	<script src="js/train.js"></script>
	<script src="js/googleMaps.js"></script>
	<script src="js/visualizations.js"></script>
	<script>
		travel('<?php print $from; ?>', '<?php print $to; ?>', '<?php print $licensePlate; ?>', <?php print json_encode($gasPrices); ?>);
	</script>
	
</body>
</html>