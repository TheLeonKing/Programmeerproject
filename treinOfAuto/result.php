<?php

require('classes/connect.php');
require('classes/gas.php');

// Only execute script when "from" and "to" location are set.
if (isset($_GET['from']) && isset($_GET['from'])) {
	$from = $_GET['from'];
	$to = $_GET['to'];
	
	// If user specified custom usage statistics.
	if (isset($_GET['customCheckbox']) && $_GET['customCheckbox'] == 'on') {
		if (isset($_GET['gasType']) && isset($_GET['gasUsage']) && isset($_GET['emission'])) {
			$customGas = ['gasType' => $_GET['gasType'], 'gasUsage' => $_GET['gasUsage'], 'emission' => $_GET['emission']];
			$licensePlate = false;
		}
		else {
			launchError('We konden uw verbruiksgegevens niet vinden.');
		}
	}
	// If user entered his/her license plate.
	else {
		if (isset($_GET['licensePlate'])) {
			$licensePlate = str_replace('-', '', trim($_GET['licensePlate']));
			$customGas = [];
		}
		else {
			launchError('We konden uw kentekengegevens niet vinden.');
		}
	}
}
else {
	launchError('We konden niet alle benodigde gegevens vinden.');
}


// Returns the user the index page with an error.
function launchError($error) {
	header('Location: index.php?error=' . $error . ' Heeft u onderstaand formulier correct ingevuld?');
}


// Establish a database connection.				
$database = new Database();
$db = $database->connect();

// Fetch the prices from the databases.
$gas = new Gas();
$gasPrices = $gas->fetchPrices($db);

// TODO:
// - Busreizen implementeren / workaround maken.
// - Bug: naar Walibi.
// - Bug: geen nummerbord --> dan wel --> nog steeds error.
// - Zig-zaglijn toevoegen aan benzinegrafiek.
// - Combined graph?
// - http://databank.worldbank.org/data/reports.aspx?source=2&Topic=6.
// - Goed testen met verschillende routes.

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>Trein of Auto: Wat is goedkoper en sneller?</title>
	
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
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
			<a href="index.php"><div class="header item">
				<img class="logo" src="images/logo.png" style="margin-right: 10px;">
				Trein of Auto
			</div></a>
			<a href="#" class="item">Kosten</a>
			<a href="#" class="item">Reis</a>
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
				<div id="mapContainer">
					<div id="gasMap"></div>
				</div>
				
				<div class="ui grid" id="gasPrices">
					<!-- Gas prices chart -->
					<div class="ten wide column">
						<div id="gasPricesChart"></div>
					</div>
					
					<!-- Cheapest gas options. -->
					<div class="six wide column">
						<div class="ui card" id="cheapestStation">
							<div class="image">
								<img src="images/loading.gif">
							</div>
							<div class="content">
								<span class="header">Even geduld...</span>
								<div class="description">
									We zoeken jouw goedkoopste tankoptie.
								</div>
							</div>
							<div class="extra content">
								<i class="euro icon"></i>
								<span class="price"></span>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Route -->
			<div class="title">
				<i class="dropdown icon"></i> Reis
			</div>
			<div class="content">
				<div id="mapContainer">
					<div id="routeMap"></div>
					<div id="legend">
						<span class="item header">LEGENDA</span>
						<span class="item car">Auto: <span id="duration_car_detail"></span></span>
						<span class="item train">Trein: <span id="duration_train_detail"></span></span>
					</div>
				</div>
				
				<!-- Parking spots button -->
				<div id="parkingButtonContainer">
					<button class="ui labeled teal icon button" onclick="findParkingSpots();">
						<i class="icon fa-map-marker"></i>
						Toon parkeerplaatsen rond bestemming
					</button>
				</div>
				
				<!-- Directions buttons -->	
				<div id="dirButtons">
					<div class="ui steps">
						<a class="active step" id="carDirButton">
							<i class="icon fa fa-car"></i>
							<div class="bContent">
								<div class="bTitle">Reisadvies auto</div>
								<div class="bDescription"></div>
							</div>
						</a>
					</div><div class="ui steps">
						<a class="step" id="trainDirButton">
							<i class="icon fa fa-train"></i>
							<div class="bContent">
								<div class="bTitle">Reisadvies trein</div>
								<div class="bDescription"></div>
							</div>
						</a>
					</div>
				</div>
				
				<!-- Directions list -->
				<div id="container">
				<div class="ui relaxed divided list" id="directions_car"></div>
				<div class="ui relaxed divided list" id="directions_train" style="display: none !important;"></div>
				</div>
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
						<h3><i class="fa fa-car"></i> <span id="emission_car"></span> gram</h3>
					</div>
					
					<!-- Train CO2 -->
					<div class="eight wide column" id="emission_train_container">
						<h3><i class="fa fa-train"></i> <span id="emission_train"></span> gram</h3>
					</div>
					
					<!-- CO2 chart -->
					<div class="sixteen wide column">
						<div class="ui info message">Toelichting.</div>
						
						<h4 class="ui header">
							<i class="users icon"></i>
							<div class="content dropdownContent">
								Ik maak deze reis
								<div class="ui inline dropdown" tabindex="0" id="amountOfJourneys">
									<div class="text">één</div>
									<i class="dropdown icon"></i>
									<div class="menu transition hidden" tabindex="-1">
										<div class="header">Frequentie reis</div>
										<div class="item active selected" data-text="één">1</div>
										<div class="item" data-text="twee">2</div>
										<div class="item" data-text="drie">3</div>
										<div class="item" data-text="vier">4</div>
										<div class="item" data-text="vijf">5</div>
										<div class="item" data-text="zes">6</div>
										<div class="item" data-text="zeven">7</div>
										<div class="item" data-text="acht">8</div>
										<div class="item" data-text="negen">9</div>
										<div class="item" data-text="tien">10</div>
										<div class="item" data-text="custom">Vaker...</div>
									</div>
								</div>
								keer per
								<div class="ui inline dropdown" tabindex="0" id="journeyFrequency">
									<div class="text">jaar</div>
									<i class="dropdown icon"></i>
									<div class="menu transition hidden" tabindex="-1">
										<div class="header">Frequentie reis</div>
										<div class="item selected" data-text="week">week</div>
										<div class="item" data-text="maand">maand</div>
										<div class="item active" data-text="jaar">jaar</div>
									</div>
								</div>
								<div class="ui inline dropdown" tabindex="0" id="amountOfPersons">
									<div class="text">in m'n eentje</div>
									<i class="dropdown icon"></i>
									<div class="menu transition hidden" tabindex="-1">
										<div class="header">Totaal reisgezelschap</div>
										<div class="item active selected" data-text="in m'n eentje">1</div>
										<div class="item" data-text="met z'n twee&#235;n">2</div>
										<div class="item" data-text="met z'n drie&#235;n">3</div>
										<div class="item" data-text="met z'n vieren">4</div>
										<div class="item" data-text="met z'n vijven">5</div>
										<div class="item" data-text="met m'n zessen">6</div>
									</div>
								</div>.
							</div>
						</h4>
						
						<canvas id="emissionChart"></canvas>
						
						<div class="ui grid">
						<!-- Car trees -->
						<div class="eight wide column">
							Er zijn <strong><span class="number" id="trees_car_text">?</span> bomen</strong> per persoon nodig om de uitstoot van deze autoreis op te absorberen.
							<div id="trees_car_visualization" class="treeVisualization"></div>
						</div>
						
						<!-- Train trees -->
						<div class="eight wide column">
							<span class="treeStat">Er zijn <strong><span id="trees_train_text">?</span> bomen</strong> per persoon nodig om de uitstoot van deze treinreis te absorberen.
							<div id="trees_train_visualization" class="treeVisualization"></div>
						</div>
						
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&language=nl&libraries=geometry,places"></script>
	<script src="js/libs/d3.min.js"></script>
	<script src="js/libs/d3.tip.min.js"></script>
	<script src="js/libs/semantic.min.js"></script>
	<script src="js/libs/moment.min.js"></script>
	<script src="js/libs/chart.min.js"></script>
	<script src="js/libs/routeboxer.min.js"></script>
	
	<script src="js/results.js"></script>
	<script src="js/car.js"></script>
	<script src="js/train.js"></script>
	<script src="js/googleMaps.js"></script>
	<script src="js/visualizations.js"></script>
	<script>
		travel('<?php print $from; ?>', '<?php print $to; ?>', '<?php print $licensePlate; ?>', <?php print json_encode($customGas); ?>, <?php print json_encode($gasPrices); ?>);
	</script>
	
</body>
</html>