$(document).ready(function() {
	
	/* Synchronous form validation (check whether fields are empty). */
	$('#journeyForm').form({
		fields: {
		fromLocation: {
			identifier	: 'fromLocation',
			rules: [
			{
				type	: 'empty',
				prompt	: 'Vul a.u.b. een startlocatie in.'
			}
			]
		},
		toLocation: {
			identifier	: 'toLocation',
			rules: [
			{
				type	: 'empty',
				prompt	: 'Vul a.u.b. een eindbestemming in.'
			}
			]
		},
		licensePlate: {
			identifier	: 'licensePlate',
			rules: [
			{
				type	: 'empty',
				prompt	: 'Vul a.u.b. een geldige kentekenplaat in.'
			}
			]
		}
		}
	});
	
	
	/* Asynchronous form validation (check whether license plate is valid). */
	$("#journeyForm").submit(function( event ) {
		event.preventDefault();
		journeyForm = this;
		var xmlhttp = new XMLHttpRequest();
		
		// Filter dashes from license plate.
		var licensePlate = $('#licensePlate').val().replace(/\-/g, '');
		var url = 'https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=' + licensePlate;
		
		// Fetch the fuel type and usage from the RDW.
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
				var responseArray = JSON.parse(xmlhttp.responseText);
				if (responseArray.length === 0) {
					var validLicense = false;
				}
				else {
					// Sometimes fuel statistics are in first element, sometimes they're in the second. Choose the right one.
					response = (typeof responseArray[0].brandstof_omschrijving === 'undefined') ? responseArray[1] : responseArray[0];
					
					var userCar = [];
					userCar['gasType'] = response.brandstof_omschrijving.toLowerCase();
				
					// If the fuel type is invalid (e.g. 'Niet geregistreerd' or a faulty value), set 'validLicense' to 'false'.
					if (userCar['gasType'] !== 'benzine' && userCar['gasType'] !== 'diesel' && userCar['gasType'] !== 'lpg') {
						var validLicense = false;
					}
					else {
						var validLicense = true;
					}
				}
				
				// Only submit form if license plate is valid.
				if (validLicense) {
					journeyForm.submit()
				}
				else {
					$('#licensePlateError').css('display', 'block');
					$('#licensePlateField').addClass('error');
				}
				
			}
		}
	
		xmlhttp.open('GET', url, true);
		xmlhttp.send();
	});

	
});