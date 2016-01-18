<?php

$postdata = http_build_query(
    array(
        'ZoekReisplannerModel.Van' => "s Hertogenbosch, Centraal Station, 5211 's-Hertogenbosch, Nederland",
		'ZoekReisplannerModel.Naar' => 'Drunen, Wolfshoek, 5151 Drunen, Nederland'
    )
); 
$opts = array('http' =>
    array(
        'method'  => 'POST',
        'header'  => 'Content-type: application/x-www-form-urlencoded',
        'content' => $postdata
    )
);

$context  = stream_context_create($opts);

$result = file_get_contents('http://www.connexxion.nl/zoekdata/reisplanner', false, $context);

echo $result;

?>