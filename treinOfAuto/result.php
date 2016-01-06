<?php

require('classes/connect.php');
require('classes/gas.php');

// Only execute script when "from" and "to" location are set.
if (isset($_GET['from']) && isset($_GET['from']) && isset($_GET['licensePlate'])) {
	$from = $_GET['from'];
	$to = $_GET['to'];
	$licensePlate = $_GET['licensePlate'];
}
else {
	die("We konden geen start- en eindlocatie vinden. Weet u zeker dat u hier rechtstreeks via onze website bent gekomen?");
}

echo $from;

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
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Trein of auto: Wat is goedkoper en sneller?</title>
	<link rel="stylesheet" href="css/main.css" />
	
	<script src="js/jquery.js"></script>
	<!--[if IE]>
	<script src="http://html5shiv.googlecode.com/svn/trunk/html5.js"></script>
	<![endif]-->
</head>
<body>
	<div id="log"></div>
	
	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&language=nl"></script>
	<script src="js/car.js"></script>
	<script src="js/googleMaps.js"></script>
	<script>
		travel('<?php print $from; ?>', '<?php print $to; ?>', '<?php print $licensePlate; ?>', <?php print json_encode($gasPrices); ?>);
	</script>
</body>
</html>