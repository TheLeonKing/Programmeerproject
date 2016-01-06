// Reads the CSV file with cars from the US government and inserts into our database.
	public function pushCars($db, $fileName) {
		
		// Open the file and skip the first line (containing the headers).
		$carFile = fopen($fileName, 'r');
		fgetcsv($carFile);
		
		while (($data = fgetcsv($carFile)) !== FALSE) {
			
			// Extract important car data.
			$car = array();
			
			$car['combinedMPG'] = floatval($data[16]);
			$car['fuelType'] = $data[31];
			$car['make'] = $data[46];
			$car['model'] = $data[47];
			$car['transmission'] = $data[57];
			$car['productionYear'] = intval($data[63]);
			
			// Most cars from before 1990 don't have a 'combined MPG' usage statistic.
			// In this case, roughly estimate this number by averaging the city and highway MPG usage.
			if ($car['combinedMPG'] == 0) {
				$cityMPG = floatval($data[58]);
				$highwayMPG = floatval($data[60]);
				$car['combinedMPG'] = ($cityMPG + $highwayMPG) / 2;
			}
			
			// Array ( [0] => Regular Gasoline [1] => Premium Gasoline [2] => Diesel [3] => Natural Gas [4] => Electricity [5] => Midgrade Gasoline )
			
			// Transmission: auto(matic) = 1, manual = 2, unknown = 0 (error handling).
			if (strpos(strtolower($car['transmission']), 'auto') !== false) {
				$car['transmission'] = 1;
			}
			else if (strpos(strtolower($car['transmission']), 'manual') !== false) {
				$car['transmission'] = 2;
			}
			else {
				$car['transmission'] = 0;
			}
			
			// Insert car into database.
			$pdo = $db->prepare('INSERT INTO cars
								 VALUES (:make, :model, :productionYear, :transmission, :fuelType, :combinedMPG)
								 ON DUPLICATE KEY UPDATE make=make');
			$pdo->bindParam(':make', $car['make'], PDO::PARAM_STR);
			$pdo->bindParam(':model', $car['model'], PDO::PARAM_STR);
			$pdo->bindParam(':productionYear', $car['productionYear'], PDO::PARAM_INT);
			$pdo->bindParam(':transmission', $car['transmission'], PDO::PARAM_INT);
			$pdo->bindParam(':fuelType', $car['fuelType'], PDO::PARAM_STR);
			$pdo->bindParam(':combinedMPG', $car['combinedMPG'], PDO::PARAM_STR);
			$pdo->execute();
			
		}
		
		echo "Auto's succesvol ingevoegd.";
	}