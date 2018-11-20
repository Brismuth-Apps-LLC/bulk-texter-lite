/**
 * Sends message to the content script to search for the hangouts elements and send messages
 */
function sendMessages(messages) {
	if (!messages) {
		return false;
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', type: 'SEND_MESSAGES', messages: messages});
	});

	ga('send', 'event', 'Messaging Popup', 'send', 'message count', messages.queue.length);
	return true;
}

/**
 * formatMessages
 * @param  {string} numbersAndNames   comma separated numbers and names split up with newlines
 * @param  {string} message           message with name piped in like "Hey {name}, this is a test."
 * @return {array}                    False if there are format errors.
 *                                      Otherwise returns an array of message objects like {number: '(123)-456-7890', message: "Hey John, this is a test."}
 */
function formatMessages(numbersAndNames, message) {
	var messages = {};
	var queue = [];
	var errors = '';

	numbersAndNames = numbersAndNames.trim();
	if (!numbersAndNames) {
		showError('No numbers provided.');
		return false;
	}

	var contacts = numbersAndNames.split('\n');
	contacts.forEach(function(contact) {
		var contactDetails = contact.split(',');
		var number = simplifyNumber(contactDetails[0]);
		if (number) {
			var formattedMessage = message.replace("{name}", (contactDetails[1] || '').trim() || 'friend').trim();
			messages[number] = formattedMessage;
			queue.push(number);
		} else {
			errors += 'Invalid phone number: ' + contactDetails[0] + '\n';
		}
	});

	if (errors) {
		showError(errors);
		return false;
	}

	return {
		messages,
		queue
	};
}

function showError(error) {
	var numbersAndNamesErrors = document.getElementById('numbers-and-names-errors');
	numbersAndNamesErrors.innerText = error;
}

function clearError() {
	showError('');
}

/**
 * removes all non-numeric characters from the number string
 * @param  {string} number   i.e. +1 (223) 456-7890
 * @return {string}          i.e. 2234567890
 */
function simplifyNumber(number) {
	var simplifiedNumber = number.trim().replace(/\D/g,'');
	// remove international code for US numbers
	if (simplifiedNumber.length === 11 && simplifiedNumber.charAt(0) === '1') {
		simplifiedNumber = simplifiedNumber.substr(1);
	}
	return simplifiedNumber;
}

/**
 * uses the chrome tabs API to check if the curren tab is hangouts or inbox
 * @return {[type]} [description]
 */
function currentlyOnSupportedTab(cb) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', type: 'CHECK_GOOGLE_VOICE_SUPPORT'}, cb);
	});
}

/**
 * configures the appropriate UI listeners for sending messages
 */
function addUIListeners() {
	var sendMessagesButton = document.getElementById('send-messages-button');
	var numbersAndNames = document.getElementById('numbers-and-names');
	var message = document.getElementById('message');

	sendMessagesButton.addEventListener('click', () => {
		clearError();
		var messages = formatMessages(numbersAndNames.value, message.value);
		if (sendMessages(messages)) {
			sendMessagesButton.disabled = true;
		}
	});

	numbersAndNames.addEventListener('change', persistTextFields);
	message.addEventListener('change', persistTextFields);
}

function persistTextFields() {
	var numbersAndNames = document.getElementById('numbers-and-names');
	var message = document.getElementById('message');

	window.localStorage.setItem('gvbt-numbers-and-names', numbersAndNames.value);
	window.localStorage.setItem('gvbt-message', message.value);
}

function restoreTextFields() {
	var numbersAndNames = document.getElementById('numbers-and-names');
	var message = document.getElementById('message');

	numbersAndNames.value = window.localStorage.getItem('gvbt-numbers-and-names');
	message.value = window.localStorage.getItem('gvbt-message') || 'Hi {name}!';
}

function showVersionNumber() {
	const manifest = chrome.runtime.getManifest();
	document.getElementById('version-number').innerText = `v${manifest.version}`;
}

/**
 * hides the spinner and shows the relevant UI
 * @param  {string} supportLevel 	'GV', 'HANGOUTS', or false
 */
function showUI(supportLevel) {
	if (supportLevel) {
		document.getElementById('ui-wrapper').style.display = 'block';
		if (supportLevel === 'HANGOUTS') {
			var sendMessagesButton = document.getElementById('send-messages-button');
			sendMessagesButton.innerText = 'Prepare Messages';
			sendMessagesButton.title = 'This will not send messages - it will just get them ready.';
			document.getElementById('hangouts-beta-warning').style.display = 'block';
		}
	} else {
		document.getElementById('wrong-page-message').style.display = 'block';
		document.getElementById('popup-body').style['min-height'] = '275px';
	}

	document.getElementById('loading-screen').style.display = 'none';
}

// configure popup button event listener
document.addEventListener('DOMContentLoaded', () => {
	currentlyOnSupportedTab(function(supportLevel) {
		ga('set', 'support-level', supportLevel);
		if (supportLevel !== false) {
			showUI(supportLevel);
			restoreTextFields();
			addUIListeners();
			showVersionNumber();
		} else {
			showUI(false);
		}
	});
});

/* google analytics */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-50081113-4', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200
ga('send', 'pageview', '/popup.html');