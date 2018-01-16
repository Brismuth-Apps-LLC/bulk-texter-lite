// load script.js in iframes
var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type && (event.data.type == "NUMBER_INPUT_FILLED")) {
		console.log("NUMBER_INPUT_FILLED, sending message to press space");
		chrome.runtime.sendMessage({ action: 'pressSpace' });
	}
});
