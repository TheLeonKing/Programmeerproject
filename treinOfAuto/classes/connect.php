<?php

class Database {
	
	// Connect to database.
	public function connect() {
		// Credentials.
		$dbHost = 'localhost';
		$dbName = 'treinofauto';
		$dbUser = 'root';
		$dbPass = 'kiefersutherland18';
		
		// Try connecting to the database using PDO (with error handling).
		try {
			$db = new PDO("mysql:host=$dbHost;dbname=$dbName", $dbUser, $dbPass);
			$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
		}
			catch (PDOException $e) {
			print "Error!: " . $e->getMessage() . "<br/>";
			die();
		}
		
		return $db;
	}
}
?>