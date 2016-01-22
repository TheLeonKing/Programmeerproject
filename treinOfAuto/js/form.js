/*
FORM.JS
Contains all JS functions that are needed for the form validation on the main page.
Note: since there is just one named function, I didn't create a separate object literal.
*/

$(document).ready(function() {
	
	/* Asynchronous form validation (check whether license plate is valid). */
	$("#journeyForm").submit(function( event ) {
		event.preventDefault();
		var journeyForm = this;
		var error = false;
		
		// Remove all existing errors.
		$('.customError').remove();
		
		// If 'from' input is empty, show an error.
		if (!$('#fromLocation').val()) {
			addError('Vul uw startlocatie in.', '#fromLocationField');
			error = true;
		} else {
			$('#fromLocationField').removeClass('error');
		}
		
		// If 'to' input is empty, show an error.
		if (!$('#toLocation').val()) {
			addError('Vul uw eindbestemming in.', '#toLocationField');
			error = true;
		} else {
			$('#toLocationField').removeClass('error');
		}
		
		// If user specified custom usage details.
		if ($('#customCheckbox').is(':checked')) {
			
			// If gas type dropdown is empty, show an error.
			if ($('#customContainer #gasTypeDropdown .text').hasClass('default')) {
				addError('Vul uw brandstoftype in.', '#gasTypeDropdown');
				error = true;
			} else {
				$('#gasTypeDropdown').removeClass('error');
			}
			
			// If usage input is not a number (or empty), show an error.
			if (!$.isNumeric($('#customContainer #usageInput input').val().replace(',', '.'))) {
				addError('Vul uw brandstofverbruik in (als cijfer).', '#usageInput');
				error = true;
			} else {
				$('#usageInput').removeClass('error');
			}
			
			// If emission input is not a number (or empty), show an error.
			if (!$.isNumeric($('#customContainer #emissionInput input').val().replace(',', '.'))) {
				addError('Vul uw CO2-uitstoot in (als cijfer).', '#emissionInput');
				error = true;
			} else {
				$('#emissionInput').removeClass('error');
			}
			
			
			// If there are no more error messages.
			if (error === false) {
				journeyForm.submit();
			}
		}
		// If user specified a license plate, check if it is valid.
		else {
			var xmlhttp = new XMLHttpRequest();
			
			// Filter dashes from license plate.
			var licensePlate = $('#licensePlate').val().replace(/\-/g, '');
			var url = 'https://opendata.rdw.nl/resource/8ys7-d773.json?kenteken=' + licensePlate;
			
			// Fetch the fuel type and usage from the RDW.
			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
					var responseArray = JSON.parse(xmlhttp.responseText);
					var validLicense = false;
					
					if (responseArray.length > 0) {
						// Sometimes fuel statistics are in first element, sometimes they're in the second. Choose the right one.
						response = (typeof responseArray[0].brandstofverbruik_gecombineerd === 'undefined') ? responseArray[1] : responseArray[0];
						
						var userCar = [];
						userCar.gasType = response.brandstof_omschrijving.toLowerCase();
					
						// If the fuel type is invalid (e.g. 'Niet geregistreerd' or a faulty value), set 'validLicense' to 'false'.
						if (!(userCar.gasType !== 'benzine' && userCar.gasType !== 'diesel' && userCar.gasType !== 'lpg')) {
							validLicense = true;
						}
					}
					
					// Show error if license is not valid.
					if (!validLicense) {
						addError('We konden geen gegevens vinden voor dit kenteken. Controleer uw invoer opnieuw, of geef hieronder zelf de gegevens op.', '#licensePlateField');
						error = true;						
					} else {
						$('#licensePlateField').removeClass('error');						
					}
					
					// Only submit form if license plate is valid and there are no other errors.
					if (error === false) {
						journeyForm.submit();
					}
					
				}
			};
		
			xmlhttp.open('GET', url, true);
			xmlhttp.send();
			
			// If there are no more error messages, submit the form.
			if (error === false && !$('.ui.error.message').is(":visible")) {
				journeyForm.submit();
			}
		}
	});
});


/* Add error message (avoids code repetition). */
function addError(errorMessage, elementName) {
	$(elementName).addClass('error');
	$('.ui.error.message').show();
	
	// If error message list is not yet visible, add it and add the error message item.
	if ($('.ui.error.message').is(':empty')) {
		$('.ui.error.message').show();
		$('.ui.error.message').html('<ul class="list"><li class="customError">' + errorMessage + '</li></ul>');
	// If list is visible, just add the error message item to it.
	} else {
		$('.ui.error.message .list').append('<li class="customError">' + errorMessage + '</li>');
	}
}