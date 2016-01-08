<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	
	<title>Trein of auto: Wat is goedkoper en sneller?</title>
	
	<link rel="stylesheet" type="text/css" href="css/libs/semantic.min.css">
	<link rel="stylesheet" href="css/main.css" />
	
	<script src="js/libs/jquery.js"></script>
	
	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->	
</head>
<body>
	
	<div class="ui middle aligned center aligned grid">
		<div class="column">
			<h2 class="ui teal image header">
				<div class="content">
					<h1>Trein of Auto?</h1>
				</div>
			</h2>
			<form action="result.php" method="get" name="search" class="ui large form" id="journeyForm">
				<div class="ui segment">
					<div class="field">
						<div class="ui left icon input">
						<i class="arrow up icon"></i>
						<input type="text" name="from" id="fromLocation" placeholder="Van..." />
						</div>
					</div>
					<div class="field">
						<div class="ui left icon input">
						<i class="arrow down icon"></i>
						<input type="text" name="to" id="toLocation" placeholder="Naar..." />
						</div>
					</div>
					<div class="field" id="licensePlateField">
						<div class="ui left icon input">
						<i class="car icon"></i>
						<input type="text" name="licensePlate" id="licensePlate" placeholder="Kenteken" />
						</div>
						<div class="ui pointing red basic label" id="licensePlateError">We konden geen gegevens vinden voor dit kenteken. Controleer uw invoer opnieuw, of geef hieronder zelf de gegevens op.</div>
					</div>
					<div class="ui fluid large teal submit button">Check je reisgegevens!</div>
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
	
	<script src="js/googleMaps.js"></script>
	<script src="js/form.js"></script>
	<script>
		addressBar('fromLocation');
		addressBar('toLocation');
	</script>
</body>
</html>