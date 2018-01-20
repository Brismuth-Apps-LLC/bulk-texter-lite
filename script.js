(function keepTryingToFindGoogleVoice() {
	var attempts = 25;
	var keepTrying = setInterval(function() {
		if (findGoogleVoice() || attempts-- < 0 || !window.location.href.includes('/webchat/')) {
			clearInterval(keepTrying);
		}
	}, 200);
})();

function findGoogleVoice() {
	var foundGoogleVoice = false;

	// check if this is the conversation list
	var button = document.querySelector('div[googlevoice="nolinks"] button');
	if (button) {
		console.log('Bulk SMS - found hangouts conversation list');

		// this button adds the number input to the dom
		button.click();

		// tells the content script to paste in the next number
		var data = { type: "NUMBER_INPUT_READY" };
		window.postMessage(data, "*");
		foundGoogleVoice = true;
	}

	// check if this is the message editor
	var messageEditor = document.querySelector('div.editable[g_editable="true"][role="textbox"][contenteditable="true"]');
	if (messageEditor) {
		console.log('Bulk SMS - found hangouts message thread');

		// tells the content script to paste in the message
		var data = { type: "MESSAGE_INPUT_READY" };
		window.postMessage(data, "*");
		foundGoogleVoice = true;
	}

	return foundGoogleVoice;
}
