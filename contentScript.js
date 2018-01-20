var phoneNumber = '(801) 420-8328';
var message = 'This is my really long message';

// load script.js in iframes
var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);

console.log("Loading content script");
window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type && (event.data.type === "NUMBER_INPUT_READY")) {
		console.log("NUMBER_INPUT_READY, filling in number");

		var numInput = document.querySelector('div[googlevoice="nolinks"] input[placeholder="Enter name, email, or phone"]');
		numInput.value = phoneNumber;
		numInput.focus();
		numInput.select();
		document.execCommand('cut');
		document.execCommand('paste');

		startChat();
	}

	if (event.data.type && (event.data.type === "MESSAGE_INPUT_READY")) {
		console.log("MESSAGE_INPUT_READY, filling in message");

		var messageEditor = document.querySelector('div.editable[g_editable="true"][role="textbox"][contenteditable="true"]');
		messageEditor.innerText = message;
		messageEditor.focus();
		document.execCommand('selectAll', false, null);

		// cut and paste
		// document.execCommand('cut');
		// messageEditor.focus();
		// document.execCommand('paste');
	}
});

// clicks the "start SMS" button on the number dropdown
function startChat() {
	var attempts = 50;
	var keepTrying = setInterval(function() {
		var startChatButton = document.querySelector('div[googlevoice="nolinks"] a[title="Click to send SMS"]');
		if (startChatButton) {
			startChatButton.click();
		}
		if (startChatButton || attempts-- < 0) {
			clearInterval(keepTrying);
		}
	}, 70);
}
