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
	die("We konden geen start- en eindlocatie vinden. Weet u zeker dat u hier rechtstreeks via onze website bent gekomen?");
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
	<link rel="stylesheet" href="css/result.css" />
	
	<script src="js/libs/jquery.js"></script>
	
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
						<br><br><br><br>
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
						<br><br><br><br>
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
				<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
			</div>
			
			<!-- Route -->
			<div class="title">
				<i class="dropdown icon"></i> Route
			</div>
			<div class="content">
				<div id="map"></div>
				<div id="legend">
					<span class="item header">LEGENDA</span>
					<span class="item car">Auto: <span id="duration_car_detail"></span></span>
					<span class="item train">Trein: <span id="duration_train_detail"></span></span>
				</div>
			</div>
			
			<!-- Environment -->
			<div class="title">
				<i class="dropdown icon"></i> Milieu
			</div>
			<div class="content">
				<div class="ui grid">
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
						<br><br><br><br>
					</div>
				</div>
			</div>
		</div>
	</div>

	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&language=nl"></script>
	<script src="js/libs/d3.min.js"></script>
	<script src="js/libs/accordion.min.js"></script>
	
	<script src="js/main.js"></script>
	<script src="js/car.js"></script>
	<script src="js/train.js"></script>
	<script src="js/googleMaps.js"></script>
	<script>
		travel('<?php print $from; ?>', '<?php print $to; ?>', '<?php print $licensePlate; ?>', <?php print json_encode($gasPrices); ?>);
	</script>
</body>
</html>