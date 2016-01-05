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
	
	
	<style>
      html, body {
        height: 100%;
        margin: 0;
        padding: 0;
      }
      #map {
        height: 100%;
      }
#floating-panel {
  position: absolute;
  top: 10px;
  left: 25%;
  z-index: 5;
  background-color: #fff;
  padding: 5px;
  border: 1px solid #999;
  text-align: center;
  font-family: 'Roboto','sans-serif';
  line-height: 30px;
  padding-left: 10px;
}

    </style>
	
	
	
</head>
<body>
	

	<form action="result.php" method="get" name="search" id="journeyForm">
		<input type="text" name="from" id="fromLocation" placeholder="Van..." />
		<input type="text" name="to" id="toLocation" placeholder="Naar..." />
		<input type="submit" />
	</form>

	<script src="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places"></script>
	<script src="js/googleMaps.js"></script>
	<script>
		addressBar('fromLocation');
		addressBar('toLocation');
	</script>
</body>
</html>