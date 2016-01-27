<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="description" content="Wat is goedkoper en sneller: de trein of de auto? Welke benzinestations en parkeerplaatsen zitten er op de route? Hoe beïnvloedt mijn reis het milieu?">
	
	<title>Trein of Auto: Wat is goedkoper en sneller?</title>
	
	<link rel="stylesheet" type="text/css" href="css/libs/semantic.min.css">
	<link rel="stylesheet" href="css/main.css" />
	
	<script src="js/libs/jquery.min.js"></script>
	
	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->	
</head>
<body>
	
	<div class="ui middle aligned center aligned grid">
		<div class="column">
			<div class="ui teal image header">
				<div class="content">
					<h1>Trein of Auto?</h1>
				</div>
			</div>
			<form action="result.php" method="get" name="search" class="ui large form" id="journeyForm">
				<div class="ui segment">
					
					<?php
					
					// Shows error message if one is set.
					if (isset($_GET['error'])) {
						// Split two-sentence error message by sentence.
						$error = explode('. ', $_GET['error']);
						print '<div class="ui negative message">
						<div class="header">' . $error[0] . '.</div>
						<p>' . $error[1] . '</p>
					</div>';
					}
					
					?>
					
					<div class="field" id="fromLocationField">
						<div class="ui left icon input">
							<i class="arrow up icon"></i>
							<input type="text" name="from" id="fromLocation" placeholder="Van..." />
						</div>
					</div>
					<div class="field" id="toLocationField">
						<div class="ui left icon input">
							<i class="arrow down icon"></i>
							<input type="text" name="to" id="toLocation" placeholder="Naar..." />
						</div>
					</div>
					<div class="field" id="licensePlateField">
						<div class="ui left icon input" id="licensePlateInput">
							<i class="car icon"></i>
							<input type="text" name="licensePlate" id="licensePlate" placeholder="Kenteken" />
						</div>
					</div>
					
					<div class="ui checkbox" id="customCheckboxContainer">
						<input type="checkbox" name="customCheckbox" id="customCheckbox" tabindex="0">
						<label for="customCheckbox">Voer zelf verbruiksgegevens in</label>
					</div>
					
					<div id="customContainer">
						<div class="ui selection dropdown" tabindex="0" id="gasTypeDropdown">
							<input type="hidden" name="gasType">
							<i class="dropdown icon"></i>
							<div class="default text">Brandstoftype</div>
							<div class="menu" tabindex="-1">
								<div class="item" data-value="benzine">Benzine</div>
								<div class="item" data-value="diesel">Diesel</div>
								<div class="item" data-value="lpg">Gas</div>
							</div>
						</div>
						
						<div class="ui input field" id="usageInput">
							<input type="text" name="gasUsage" placeholder="Verbruik (ltr/100 km)">
						</div>
						
						<div class="ui input field" id="emissionInput">
							<input type="text" name="emission" placeholder="CO2-uitstoot (g/km)">
						</div>
					</div>

					<div class="ui fluid large teal submit button">Vergelijk!</div>
				</div>

				<div class="ui error message"></div>
			</form>
			<div class="ui message">
				Met <strong>Trein of Auto</strong> ziet u in &#233;&#233;n oogopslag de verschillen tussen een
				trein- en autoreis tussen twee locaties. Vergelijk uw reis op gebieden als <strong>prijs</strong>,
				<strong>reisduur</strong> en <strong>milieuvriendelijkheid</strong>.
			</div>
		</div>
	</div>

	
	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places"></script>
	<script src="js/libs/semantic.min.js"></script>
	
	<script src="js/main.js"></script>
	<script src="js/googleMaps.js"></script>
	<script src="js/form.js"></script>
	<script>
		GoogleMaps.addressBar('fromLocation');
		GoogleMaps.addressBar('toLocation');
	</script>
</body>
</html>