/**
 * There are two components, the ListViewManager and the ThreadViewManager.
 * The ListViewManager runs on the Hangouts conversation listview.
 * The ThreadViewManager runs on the Hangouts thread.
 * These communicate via the chrome runtime message system because they are in separate iframes.
 */

class ListViewManager {
	constructor() {
		this.messagesToSend = {};
		this.numberQueue = [];
		this.currentNumberSending = '';
	}

	initialize() {
		var that = this;

		chrome.runtime.onMessage.addListener(function (message, sender, response) {
			if (message.from === 'popup' && message.type === 'SEND_MESSAGES') {
				that.addMessagesToQueue(message.messages);
				that.sendFromQueue();

				// response to popup.js
				response();
			}

			if (message.type === 'THREAD_VIEW_READY') {
				that.sendMessage(message.number);

				// proceed next message
				that.sendFromQueue();
			}
		});
	}

	addMessagesToQueue(messages) {
		Object.assign(this.messagesToSend, messages.messages);
		this.numberQueue = this.numberQueue.concat(messages.queue);
	}

	sendFromQueue() {
		var that = this;

		if (this.numberQueue.length > 0) {
			this.currentNumberSending = this.numberQueue.shift();
			this.showNumberInput(function(successful) {
				if (!successful) {
					return alert('Error: could not find phone number input.')
				}
				that.fillNumberInput();
				that.startChat();
			});
		}
	}

	showNumberInput(cb) {
		var that = this;
		keepTrying(clickButton, 70, 50, false, cb);

		function clickButton() {
			var showInputButton = document.querySelector('div[googlevoice="nolinks"] button');
			if (showInputButton) {
				showInputButton.click();
				return true;
			}
		}
	}

	fillNumberInput() {
		if (this.messagesToSend.length < 1) {
			return false;
		}

		var numInput = document.querySelector('div[googlevoice="nolinks"] input[placeholder="Enter name, email, or phone"]');
		numInput.value = this.currentNumberSending;

		// this fires the necessary events for Google Voice to pick up
		setTimeout(function() {
			numInput.focus();
			numInput.select();
			document.execCommand('cut');
			document.execCommand('paste');
		}, 10);
	}

	// clicks the "start SMS" button on the number dropdown
	startChat() {
		var that = this;
		keepTrying(clickButton, 70, 50, false);

		function clickButton() {
			var startChatButton = document.querySelector('div[googlevoice="nolinks"] a[title="Click to send SMS"]');
			if (startChatButton) {
				startChatButton.click();
				return true;
			}
		}
	}

	sendMessage(number) {
		if (!this.messagesToSend[number]) {
			return false;
		}

		chrome.runtime.sendMessage({
			type: 'SEND_MESSAGE',
			number: number,
			message: this.messagesToSend[number]
		});

		delete this.messagesToSend[number];
	}
}

class ThreadViewManager {
	initialize() {
		var that = this;
		this.number = this.getPhoneNumberForCurrentChat();

		chrome.runtime.onMessage.addListener(function (message, sender, response) {
			if (message.number !== that.number)
				return;

			if (message.type === 'SEND_MESSAGE') {
				that.fillMessageInput(message.message);
			}

			response();
		});

		this.notifyInputReady();
	}

	notifyInputReady() {
		chrome.runtime.sendMessage({
			type: 'THREAD_VIEW_READY',
			number: this.number,
		});
	}

	fillMessageInput(message) {
		var messageEditor = document.querySelector('div.editable[g_editable="true"][role="textbox"][contenteditable="true"]');
		this.hideDefaultText();
		messageEditor.innerText = message;
		messageEditor.focus();
	}

	hideDefaultText() {
		var spans = document.evaluate("//span[contains(., 'Send an SMS message')]", document, null, XPathResult.ANY_TYPE, null );
		var defaultTextSpan = spans.iterateNext();
		defaultTextSpan.style.display = 'none';
	}

	// todo - format all numbers consistently so they work well as keys
	getPhoneNumberForCurrentChat() {
		// get buttons that have a title that starts with "Call "
		var callButton = document.querySelector('button[title^="Call "]')
		if (callButton) {
			var number = callButton.title.replace('Call ', '');
			return formatNumber(number);
		}
	}
}


const listViewManager = new ListViewManager();
const threadViewManager = new ThreadViewManager();

/**
 * removes all non-numeric characters from the number string
 * @param  {string} number   i.e. (123) 456-7890
 * @return {string}          i.e. 1234567890
 */
function formatNumber(number) {
	return number.replace(/\D/g,'');
}

/**
 * continually calls the given method until successful
 * @param  {Function}   method          should return true when successful, or false when we should give up early
 * @param  {int}        frequency       in ms
 * @param  {int}        tryCount        max # of tries
 * @param  {bool}       silenceErrors   true if we should not alert on errors
 * @param  {Function}   cb        	    to be called with the results from method when we're done trying
 */
function keepTrying(method, frequency, tryCount, silenceErrors, cb) {
	var keepTryingInterval = setInterval(function() {
		var successful = method();
		var giveUp = successful === false || tryCount-- < 0;
		if (successful === true || giveUp) {
			clearInterval(keepTryingInterval);
			// the app failed
			if (!silenceErrors && tryCount < 1) {
				alert('Google Voice bulk texter:\nText failed. Are you sure Google Voice via Hangouts is enabled on this page?');
			}
			if (cb) {
				cb(successful);
			}
		}
	}, frequency);
}


/*******************************************************************************************************************
********* Identifies whether we're in the listview or thread view, configures appropriately ************************
********************************************************************************************************************/
keepTrying(findGoogleVoice, 200, 25, true);
function findGoogleVoice() {
	// stop looking, wrong url
	if (!window.location.href.includes('/webchat/')) {
		return false;
	}

	// check if this is the conversation list
	var button = document.querySelector('div[googlevoice="nolinks"] button');
	if (button) {
		console.log('Bulk SMS - configuring list view');
		listViewManager.initialize();
		return true;
	}

	// check if this is the message editor
	var messageEditor = document.querySelector('div.editable[g_editable="true"][role="textbox"][contenteditable="true"]');
	if (messageEditor) {
		console.log('Bulk SMS - configuring thread');
		threadViewManager.initialize();
		return true;
	}
}
