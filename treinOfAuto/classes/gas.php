<?php

class Gas {
	
	// Crawls the gas prices from a web page and returns an array containing the prices.
	public function crawlPrices() {

		// Get the HTML from the United Consumers 'Gas Prices' page.
		$html = file_get_html('https://www.unitedconsumers.com/tanken/informatie/brandstof-prijzen.asp');
		$priceArray = array();

		// Find the first table (which contains the gas prices), loop over each row.
		foreach($html->find('table', 0)->find('tr') as $row) {
			$counter = 0;
			
			// For each cell in the row...
			foreach($row->find('td') as $cell) {
				$counter++;
				
				// Extract the gas type (e.g. 'Euro95' or 'Diesel') from the first cell.
				if ($counter == 1) {
					$gasType = strtolower(trim($cell->plaintext));
					
					// This will make things easier later on.
					if ($gasType == 'euro95') {
						$gasType == 'benzine';
					}
				}
				
				// We're only interested in the prices of Euro95, Diesel and LPG.
				if ($gasType == 'euro95' || $gasType == 'diesel' || $gasType == 'lpg') {
					// Extract the average price from the second cell.
					if ($counter == 2) {
						$averagePrice = trim($cell->plaintext);
						$priceArray[$gasType]['average'] = floatval(str_replace(',', '.',($averagePrice)));
					}
					// Cells 5 to 9 (last cell) contain prices of individual gas stations.
					// These cells have title attributes like 'BP Euro95'.
					else if ($counter > 4) {
						// Extract gas station (e.g. 'BP Euro95' to 'BP')
						$cellTitle = explode(' ', $cell->find('span', 0)->title);
						$gasStation = strtolower($cellTitle[0]);
						
						$priceArray[$gasType][$gasStation] = floatval(str_replace(',', '.',($cell->plaintext)));
					}
				}
			}
		}
		
		echo 'Prijzen succesvol bijgewerkt.';
		
		return $priceArray;
	}
	
	
	// Takes an array containing gas prices and pushes it to the database.
	public function pushPrices($db, $priceArray) {
		
		// For each gas type in the array, update the corresponding row in the table.
		foreach ($priceArray as $gasType => $prices) {
			// Put 'euro95' in the database as 'benzine'.
			if ($gasType == 'euro95') {
				$gasType = 'benzine';
			}
			
			$pdo = $db->prepare('UPDATE gas_prices
								 SET average = :average, bp = :bp, esso = :esso, shell = :shell, texaco = :texaco, total = :total
								 WHERE gas_type= :gasType');
			$pdo->bindParam(':average', $prices['average'], PDO::PARAM_STR);
			$pdo->bindParam(':bp', $prices['bp'], PDO::PARAM_STR);
			$pdo->bindParam(':esso', $prices['esso'], PDO::PARAM_STR);
			$pdo->bindParam(':shell', $prices['shell'], PDO::PARAM_STR);
			$pdo->bindParam(':texaco', $prices['texaco'], PDO::PARAM_STR);
			$pdo->bindParam(':total', $prices['total'], PDO::PARAM_STR);
			$pdo->bindParam(':gasType', $gasType, PDO::PARAM_STR);
			$pdo->execute();
		}
		
	}
	
	
	// Fetches the prices from our own database, returns an array containing these prices.
	public function fetchPrices($db) {
		
		$pdo = $db->prepare('SELECT *
							 FROM gas_prices');
		$pdo->execute();
		
		// Return an array, with the gas type as key and the prices array as value.
		return array_map('reset', $pdo->fetchAll(PDO::FETCH_GROUP|PDO::FETCH_ASSOC));
		
	}

}

?>