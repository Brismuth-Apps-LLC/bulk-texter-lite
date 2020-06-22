const defaultSendInterval = 3;
const sendIntervalOptions = [
	{
		delay: 500,
		label: '1/2 second (may be unstable)'
	},
	{
		delay: 1000,
		label: '1 second (may be unstable)'
	},
	{
		delay: 2000,
		label: '2 seconds'
	},
	{
		delay: 5000,
		label: '5 seconds'
	},
	{
		delay: 10000,
		label: '10 seconds'
	},
	{
		delay: 15000,
		label: '15 seconds'
	},
	{
		delay: 30000,
		label: '30 seconds'
	},
	{
		delay: 45000,
		label: '45 seconds'
	},
	{
		delay: 60000,
		label: '1 minute'
	},
	{
		delay: 120000,
		label: '2 minutes'
	},
	{
		delay: 300000,
		label: '5 minutes'
	},
	{
		delay: 600000,
		label: '10 minutes'
	}
];

const message = document.getElementById('message');
const numbersAndNames = document.getElementById('numbers-and-names');
const sendMessagesButton = document.getElementById('send-messages-button');
const tosAgreement = document.getElementById('gv-tos-agreement');
const sendIntervalSlider = document.getElementById('send-interval-slider');

/**
 * Sends message to the content script to search for the hangouts elements and send messages
 */
function sendMessages(messages, sendInterval) {
	if (!messages) {
		return false;
	}

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {
			from: 'popup',
			type: 'SEND_MESSAGES',
			messages: messages,
			sendInterval: sendInterval
		});
	});

	logEvent({
		eventLabel: 'MESSAGE_ATTEMPT',
		eventValue: messages.queue.length
	});

	logEvent({
		eventLabel: 'SEND_INTERVAL',
		eventValue: sendInterval
	});

	window.close();
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
			var formattedMessage = message.replace(/\{name\}/g, (contactDetails[1] || '').trim() || 'friend').trim();
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
 * uses the chrome tabs API to check if the curren tab is hangouts
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
	sendMessagesButton.addEventListener('click', () => {
		clearError();

		var agreedToTerms = tosAgreement.checked;
		if  (!agreedToTerms) {
			showError('Please read the Google Voice Acceptable Use Policy and check the box below.');
			return;
		}

		var messages = formatMessages(numbersAndNames.value, message.value);
		var sendInterval = sendIntervalOptions[sendIntervalSlider.value].delay;
		if (sendMessages(messages, sendInterval)) {
			sendMessagesButton.disabled = true;
		}
	});

	numbersAndNames.addEventListener('change', persistPopupFields);
	message.addEventListener('change', persistPopupFields);
	tosAgreement.addEventListener('change', persistPopupFields);
	sendIntervalSlider.addEventListener('change', persistPopupFields);
}

function persistPopupFields() {
	chrome.storage.local.set({
		popupNumbersAndNames: numbersAndNames.value,
		popupMessage: message.value,
		tosAgreement: tosAgreement.checked,
		sendInterval: sendIntervalOptions[sendIntervalSlider.value].delay
	});
}

function restoreTextFields() {
	chrome.storage.local.get(['popupNumbersAndNames', 'popupMessage', 'tosAgreement', 'sendInterval'], function(items){
		numbersAndNames.value = items.popupNumbersAndNames || '';
		message.value = items.popupMessage || 'Hi {name}!';
		tosAgreement.checked = items.tosAgreement || false;

		// set the send interval slider
		let setIndexTo = defaultSendInterval;
		sendIntervalOptions.forEach((value, index) => {
			if (value.delay === items.sendInterval) {
				setIndexTo = index;
			}
		});
		sendIntervalSlider.value = setIndexTo;
		sendIntervalSlider.oninput();
	});
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
			sendMessagesButton.innerText = 'Prepare Messages';
			sendMessagesButton.title = 'This will not send messages - it will just get them ready.';
			document.getElementById('hangouts-beta-warning').style.display = 'block';
			document.getElementById('send-interval-block').style.display = 'none';
		}
	} else {
		document.getElementById('wrong-page-message').style.display = 'block';
		document.getElementById('popup-body').style['min-height'] = '180px';
	}

	document.getElementById('loading-screen').style.display = 'none';
}

function configureIntervalSlider() {
	sendIntervalSlider.setAttribute('max', sendIntervalOptions.length - 1);

	let output = document.getElementById('send-interval-output');
	sendIntervalSlider.oninput = function(){
		output.innerHTML = `Delay ${sendIntervalOptions[this.value].label}`;
	};
}

// configure popup button event listener
document.addEventListener('DOMContentLoaded', () => {
	currentlyOnSupportedTab(function(supportLevel) {
		logEvent({
			hitType: 'pageview',
			page: '/' + (supportLevel || 'UNSUPPORTED')
		});

		if (supportLevel !== false) {
			showUI(supportLevel);
			configureIntervalSlider();
			restoreTextFields();
			addUIListeners();
			showVersionNumber();
		} else {
			showUI(false);
		}
	});
});
