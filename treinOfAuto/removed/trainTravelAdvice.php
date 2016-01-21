<?php

if (isset($_POST['from']) && isset($_POST['to'])) {
	// Login credentials.
	$username = 'leonkempers@gmail.com';
	$password = '1zoCc5Ut4tINUUcB7R7wjShaT72KIsDSogLljoheQyMCpGJ19C0IOQ';
	
	// Fetch 'from' and 'to' stations from POST.
	$from = strip_tags($_POST['from']);
	$to = strip_tags($_POST['to']);	
	
	// Create an object with my credentials.
	$credentials = stream_context_create(array(
		'http' => array(
			'header'  => "Authorization: Basic " . base64_encode("$username:$password")
		)
	));
	
	// Request the travel advice from the API.
	$urlNS = "http://webservices.ns.nl/ns-api-treinplanner?fromStation=$from&toStation=$to&departure=trueexterne";
	echo json_encode(simplexml_load_string(file_get_contents($urlNS, false, $credentials)));
}

?>