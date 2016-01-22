/*
MAIN.JS
Contains all general JS functions for the index page.
*/


/* Initializes the dropdown. */
$(document).ready(function(){
	$('.ui.dropdown').dropdown();
});


/* Submits form when user clicks submit button. */
$('.submit.button').click(function() {
	$('#journeyForm').submit();
});


/* Shows custom usage form when user ticks checkbox. */
$('#customCheckbox').click(function() {
	// If custom form is visible, hide it + enable license plate input.
	if ($('#customContainer').is(':visible')) {
		$('#licensePlateInput').removeClass('disabled');
		$('#customContainer').slideUp();	
	// If custom form is invisible, show it + disable license plate input.
	} else {
		$('#licensePlateInput').addClass('disabled');
		$('#licensePlateInput input').val('');		
		$('#customContainer').slideDown();		
	}
});