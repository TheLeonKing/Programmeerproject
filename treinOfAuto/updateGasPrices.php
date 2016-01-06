<?php

require('includes/simple_html_dom.php');

require('classes/connect.php');
require('classes/gas.php');

// Establish a database connection.				
$database = new Database();
$db = $database->connect();

// Crawl the most recent prices from the web and update our own database with these prices.
$gas = new Gas();
$prices = $gas->crawlPrices();
$gas->pushPrices($db, $prices);

?>