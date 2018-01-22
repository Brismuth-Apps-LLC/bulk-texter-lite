// this acts as a proxy for the content scripts in the different iframes to talk to each other
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, message, function(response) {});
	});
});