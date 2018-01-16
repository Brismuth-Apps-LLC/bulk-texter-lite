var phoneNumber = '###-###-####';
var message = 'This is my really long message';
// todo: replace with event
setTimeout(function() {
	findGoogleVoice(phoneNumber, message);
}, 2000);

function findGoogleVoice(phoneNumber, message) {
	var button = document.querySelector('div[googlevoice="nolinks"] button');
	if (button) {
		console.log('Bulk SMS - found hangouts conversation list');
		button.click();
		var numInput = document.querySelector('div[googlevoice="nolinks"] input[placeholder="Enter name, email, or phone"]');
		numInput.value = phoneNumber;
		numInput.focus();

		// this should trigger a key event but the key event press isn't registering. Some work required.
		var data = { type: "NUMBER_INPUT_FILLED" };
		window.postMessage(data, "*");

		numInput.addEventListener("keyup", startChat, false);
	}

	var messageEditor = document.querySelector('div.editable[g_editable="true"][role="textbox"][contenteditable="true"]');
	if (messageEditor) {
		console.log('Bulk SMS - found hangouts message thread');
		messageEditor.innerText = message;
	}
}

function startChat() {
	setTimeout(function() {
		var startChatButton = document.querySelector('div[googlevoice="nolinks"] a[title="Click to send SMS"]');
		startChatButton.click();
	}, 100);
}