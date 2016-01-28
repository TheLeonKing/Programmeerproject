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

?>
<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title><?php print 'Trein of Auto: Van ' . $from . ' naar ' . $to; ?></title>
	
	<link rel="stylesheet" type="text/css" href="css/libs/semantic.min.css">
	<link rel="stylesheet" type="text/css" href="css/libs/font-awesome.min.css">
	<link rel="stylesheet" type="text/css" href="css/libs/ionicons.min.css">
	<link rel="stylesheet" href="css/result.css" />
	<link rel="stylesheet" href="css/visualizations.css" />
	
	<script src="js/libs/jquery.min.js"></script>
	<script type='text/javascript' src="http://cdnjs.cloudflare.com/ajax/libs/jquery-ajaxtransport-xdomainrequest/1.0.1/jquery.xdomainrequest.min.js"></script>
	
	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->	
</head>
<body>
	<div class="ui borderless main menu">
		<div class="ui text container">
			<a href="index.php"><div class="header item">
				<img class="logo" src="images/logo.png" style="margin-right: 10px;" alt="Trein of Auto" />
				Trein of Auto
			</div></a>
			<a data-href="0" class="item">Kosten</a>
			<a data-href="1" class="item">Reis</a>
			<a data-href="2" class="item">Milieu (reis)</a>
			<a data-href="3" class="item">Milieu (algemeen)</a>
		</div>
	</div>
	
	<!-- Shown when visualizations are being loaded -->
	<div id="loadOverlay">
		<div id="loadContainer">
			<img src="images/beancar.gif" alt="Laden..." />
			<span id="loadTitle">Even geduld...</span>
			<span id="loadText">We halen uw reisgegevens op.</span>
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
			<div class="content" id="kosten">
				<div id="gasMap"></div>
				
				<div class="ui grid" id="gasPrices">
					<!-- Gas prices chart -->
					<div class="ten wide column">
						<div id="gasPricesChart"></div>
					</div>
					
					<!-- Cheapest gas options. -->
					<div class="six wide column">
						<div class="ui card" id="cheapestStation">
							<div class="image">
								<img src="images/loading.gif" alt="Laden..." />
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
					<button class="ui labeled teal icon button" onclick="GoogleMaps.findParkingSpots();">
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
				<i class="dropdown icon"></i> Milieu (reis)
			</div>
			<div class="content">
				
				<div class="ui center grid">
					<div class="sixteen wide column">
						<h2>Milieuvriendelijker: <span id="emission_winner"></span></h2>
					</div>
					
					<!-- Car CO2 -->
					<div class="eight wide column" id="emission_car_container">
						<h3><i class="fa fa-car"></i> <span id="emission_car"></span> gram</h3> <div class="asterisk">*</div>
					</div>
					
					<!-- Train CO2 -->
					<div class="eight wide column" id="emission_train_container">
						<h3><i class="fa fa-train"></i> <span id="emission_train"></span> gram</h3> <div class="asterisk">*</div>
					</div>
					
					<!-- CO2 chart -->
					<div class="sixteen wide column">
						<div class="ui info message">Door een autorit met meerdere mensen te maken (dit noemen we "carpoolen"), neemt de gemiddelde uitstoot per persoon af. Zo kan een autorit in sommige gevallen milieuvriendelijker worden dan een treinreis!</div>
						
						<div class="persons ui header">
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
						</div>
						
						<!-- Journey emission chart -->
						<canvas id="emissionChart"></canvas>
						
						<div class="ui grid">
							<!-- Car trees -->
							<div class="eight wide column">
								Er zijn <strong><span class="number" id="trees_car_text">?</span> bomen</strong> per persoon nodig om de uitstoot van deze auto<span class="reisreizen">reis</span> op te absorberen. <div class="asterisk">*</div>
								<div id="trees_car_visualization" class="treeVisualization"></div>
							</div>
							
							<!-- Train trees -->
							<div class="eight wide column">
								<div class="treeStat">Er zijn <strong><span id="trees_train_text">?</span> bomen</strong> per persoon nodig om de uitstoot van deze trein<span class="reisreizen">reis</span> te absorberen. <div class="asterisk">*</div></div>
								<div id="trees_train_visualization" class="treeVisualization"></div>
							</div>
							
							<!-- Disclaimer -->
							<div class="sixteen wide column">
								<div class="ui warning message shake-hard" id="disclaimer">
									Disclaimer (*): de cijfers op deze pagina zijn ruwe schattingen gebaseerd op gemiddeldes en de informatie 
									die de fabrikant van uw auto aanbiedt. De ware uitstoot kan variëren door factoren als weersomstandigheden, gewichtsbelasting en rijstijl. De "bomenberekening" 
									is gebaseerd op cijfers van de NC State University en berekent hoeveel bomen er naar schatting <strong>jaarlijks</strong> nodig zijn om de CO2 van de aangegeven 
									reis/reizen te absorberen. De uitstootstatistieken van de trein zijn gebaseerd op cijfers uit het
									<a href="http://2013.nsjaarverslag.nl/jaarverslag-2013/s1046_VerslagVanActiviteiten/s1101_WiZijZuiniOOnzOmgevin/s1106_EnergieveDoTreINederla/a1153_default" target="_blank">NS Jaarverslag</a>.
								</div>
							</div>

						</div>
						
					</div>
				</div>
			</div>
			
			
			<div class="title">
				<i class="dropdown icon"></i> Milieu (algemeen)
			</div>
			<div class="content">
				
				<div class="ui center grid">
					
					<div class="sixteen wide column" id="regionVisualizations">
						
						<h3>CO2-uitstoot verkeer en vervoer in 2013 (excl. railverkeer), per gemeente</h3>
						
						<!-- Region emission map -->
						<div id="regionMap"></div>
						
						<!-- Region emission chart -->
						<div id="regionChart"></div>
						
					</div>
				</div>
			</div>
			
			
		</div>
	</div>

	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&language=nl&libraries=geometry,places"></script>
	<script src="js/libs/d3.min.js"></script>
	<script src="js/libs/d3.tip.min.js"></script>
	<script src="js/libs/queue.v1.min.js"></script>
	<script src="js/libs/topojson.v1.min.js"></script>
	<script src="js/libs/semantic.min.js"></script>
	<script src="js/libs/moment.min.js"></script>
	<script src="js/libs/chart.min.js"></script>
	<script src="js/libs/routeboxer.min.js"></script>
	
	<script src="js/result.js"></script>
	<script src="js/car.js"></script>
	<script src="js/train.js"></script>
	<script src="js/googleMaps.js"></script>
	<script src="js/visualize.js"></script>
	<script>
		Result.travel("<?php print $from; ?>", "<?php print $to; ?>", '<?php print $licensePlate; ?>', <?php print json_encode($customGas); ?>, <?php print json_encode($gasPrices); ?>);
	</script>
	
</body>
</html>