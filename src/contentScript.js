const siteIsGoogleVoice = window.location.href.startsWith('https://voice.google.com');

// selectors
const selectors = {
	// google voice
	gvMessagesTab: 'div[aria-label^="Message"][role="tab"]',
	gvNumInputButton: 'div[gv-id="send-new-message"]',
	gvNumInput: 'gv-recipient-picker input[placeholder="Type a name or phone number"]',
	gvStartChatButton: 'gv-contact-list div[ng-class="::ctrl.Css.SEARCH_LIST"] div[ng-class="[\'md-body-1\', ctrl.Css.SEND_TO_PHONE_NUMBER]"]',
	gvExpandRecipientButton: 'div[aria-label="Select recipients"] md-chips md-chip button',
	gvRecipientNumber: 'span[gv-test-id="chip-menu-item-phone-number"]',
	gvMessageEditor: 'textarea[aria-label="Type a message"]',
	gvSendButton: 'gv-icon-button[icon-name="send"] button[aria-label="Send message"]',

	// hangouts
	hangoutsNumInputButton: 'div[googlevoice="nolinks"] button',
	hangoutsNumInput: 'div[googlevoice="nolinks"] input[placeholder="Enter name, email, or phone"]',
	hangoutsStartChat: 'div[googlevoice="nolinks"] a[title="Click to send SMS"]',
	hangoutsCallButton: 'button[title^="Call "]',
	hangoutsMessageEditor: 'div.editable[g_editable="true"][role="textbox"][contenteditable="true"]'
};

/*********************************************************************************************************************************************************
********* Identifies whether we're in the hangouts listview or hangouts thread view or voice.google.com, configures appropriately ************************
*********************************************************************************************************************************************************/
keepTryingAsPromised(findGoogleVoice, true);
function findGoogleVoice() {
	// stop looking, wrong url
	if (!window.location.href.includes('/webchat/') && !window.location.href.startsWith('https://voice.google.com')) {
		return false;
	}

	// check if this is the google voice site
	var button = document.querySelector(selectors.gvMessagesTab);
	if (button && siteIsGoogleVoice) {
		console.log('Bulk SMS - configuring google voice site');
		const googleVoiceSiteManager = new GoogleVoiceSiteManager();
		googleVoiceSiteManager.initialize();
		return true;
	}

	// check if this is the hangouts conversation list
	var button = document.querySelector(selectors.hangoutsNumInputButton);
	if (button) {
		console.log('Bulk SMS - configuring list view');
		const hangoutsListViewManager = new HangoutsListViewManager();
		hangoutsListViewManager.initialize();
		return true;
	}

	// check if this is the hangouts message editor
	var messageEditor = document.querySelector(selectors.hangoutsMessageEditor);
	if (messageEditor) {
		console.log('Bulk SMS - configuring thread');
		const hangoutsThreadViewManager = new HangoutsThreadViewManager();
		hangoutsThreadViewManager.initialize();
		return true;
	}
}


/**
 * This runs on voice.google.com
 */
class GoogleVoiceSiteManager {
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
		
				// switch To Text View
				document.querySelector(selectors.gvMessagesTab).click();
				
				that.sendFromQueue();
			}

			if (message.from === 'popup' && message.type === 'CHECK_GOOGLE_VOICE_SUPPORT') {
				var url = window.location.href;
				response(url.startsWith('https://voice.google.com/') ? 'GV' : false);
			}
		});
	}

	addMessagesToQueue(messages) {
		Object.assign(this.messagesToSend, messages.messages);
		this.numberQueue = this.numberQueue.concat(messages.queue);
	}

	async sendFromQueue() {
		var that = this;

		if (this.numberQueue.length > 0) {
			this.currentNumberSending = this.numberQueue.shift();
			const successful = await this.showNumberInput();
			if (!successful) {
				return alert('Google Voice bulk texter:\nError: could not find phone number input.')
			}
			await that.fillNumberInput();
			await that.startChat();
			const chatSwitched = await that.confirmChatSwitched();
			if (!chatSwitched) {
				alert('Google Voice bulk texter:\nAn error occurred, please try again.');
				this.messagesToSend.length = 0;
				return false;
			}
			that.sendMessage();
		}
	}

	async showNumberInput() {
		return await keepTryingAsPromised(showNumInput, false);
		function showNumInput() {
			var showInputButton = document.querySelector(selectors.gvNumInputButton);
			if (showInputButton) {
				showInputButton.click();
				return true;
			}
		}
	}

	async fillNumberInput() {
		var that = this;
		if (this.messagesToSend.length < 1) {
			return false;
		}

		return await keepTryingAsPromised(fillInput, false);
		function fillInput() {
			let numInput = document.querySelector(selectors.gvNumInput);
			if (numInput) {
				numInput.value = that.currentNumberSending;

				// this fires the necessary events for Google Voice to pick up
				numInput.focus();
				numInput.select();
				document.execCommand('cut');
				document.execCommand('paste');
			
				// confirm that the number was added as expected
				let numInputConfirm = document.querySelector(selectors.gvNumInput);
				return numInputConfirm.value === that.currentNumberSending;
			}
		}
	}

	// clicks the "start SMS" button on the number dropdown
	async startChat() {
		return await keepTryingAsPromised(clickStartChat, false);
		function clickStartChat() {
			var startChatButton = document.querySelector(selectors.gvStartChatButton);
			if (startChatButton) {
				startChatButton.click();
				return true;
			}
		}
	}

	async confirmChatSwitched() {
		var that = this;
		return await keepTryingAsPromised(confirmSwitched, false);
		
		function confirmSwitched() {
			const numberToSend = that.currentNumberSending;
			document.querySelector(selectors.gvExpandRecipientButton).click();
			var numberElem = document.querySelector(selectors.gvRecipientNumber);
			var number = numberElem.innerText.trim().replace(/\D/g,'');
			return numberToSend === number;
		}
	}

	sendMessage() {
		const number = this.currentNumberSending;
		if (!this.messagesToSend[number]) {
			return false;
		}

		const message = this.messagesToSend[number];

		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		messageEditor.value = message;

		// this fires the necessary events for Google Voice to pick up
		setTimeout(() => {
			messageEditor.focus();
			messageEditor.select();
			document.execCommand('cut');
			document.execCommand('paste');

			// click send button
			document.querySelector(selectors.gvSendButton).click();
			

			// continue with queue
			delete this.messagesToSend[number];
			this.sendFromQueue();
		}, 600);
	}
}


/**
 * There are two components for hangouts messaging, the HangoutsListViewManager and the HangoutsThreadViewManager.
 * The HangoutsListViewManager runs on the Hangouts conversation listview.
 * The HangoutsThreadViewManager runs on the Hangouts thread.
 * These communicate via the chrome runtime message system because they are in separate iframes.
 */
class HangoutsListViewManager {
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
			}

			if (message.from === 'popup' && message.type === 'CHECK_GOOGLE_VOICE_SUPPORT') {
				var url = window.location.href;
				response((url.startsWith('https://hangouts.google.com/')
					|| url.startsWith('https://inbox.google.com/')) ? 'HANGOUTS' : false);
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
					return alert('Google Voice bulk texter:\nError: could not find phone number input.')
				}
				that.fillNumberInput();
				that.startChat();
			});
		}
	}

	showNumberInput(cb) {
		var that = this;
		keepTrying(clickButton, false, cb);

		function clickButton() {
			var showInputButton = document.querySelector(selectors.hangoutsNumInputButton);
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

		var numInput = document.querySelector(selectors.hangoutsNumInput);
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
		keepTrying(clickButton, false);

		function clickButton() {
			var startChatButton = document.querySelector(selectors.hangoutsStartChat);
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

class HangoutsThreadViewManager {
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
		var messageEditor = document.querySelector(selectors.hangoutsMessageEditor);
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
		var callButton = document.querySelector(selectors.hangoutsCallButton);
		if (callButton) {
			var number = callButton.title.replace('Call ', '');
			return formatNumber(number);
		}
	}
}

/**
 * removes all non-numeric characters from the number string
 * @param  {string}   number i.e. (123) 456-7890
 * @return {string}         i.e. 1234567890
 */
function formatNumber(number) {
	return number.replace(/\D/g,'');
}

/**
 * continually calls the given method until successful
 * @param {Function}   method         should return true when successful, or false when we should give up early
 * @param {bool}       silenceErrors  true if we should not alert on errors
 * @param {Function}   cb             to be called with the results from method when we're done trying
 */
function keepTrying(method, silenceErrors, cb) {
	const frequency = 500; // try every 500ms
	let tryCount = 5 * 1000/frequency; // keep trying for 5 seconds
	var keepTryingInterval = setInterval(function() {
		var successful = method();
		var giveUp = successful === false || tryCount-- < 0;
		if (successful === true || giveUp) {
			clearInterval(keepTryingInterval);
			// the app failed
			if (!silenceErrors && tryCount < 1) {
				if (siteIsGoogleVoice) {
					alert("Google Voice bulk texter:\nText failed. Make sure you haven't enabled texting via Hangouts, as that will disable sending messages via the Google Voice app.\n\nIf the error persists, please send this error code to the developer.\n\nError: \"" + method.name + "\" failed.\n\nWhen you click \"ok\" the page will refresh.");
				} else {
					alert('Google Voice bulk texter:\nText failed. Are you sure Google Voice texting via Hangouts is enabled?\nAlso, be aware that this extension is not compatible with the Google Hangouts Chrome extension. If you have the Hangouts extension installed you\'ll need to temporarily disable it.\n\nWhen you click \"ok\" the page will refresh.');
				}
				window.location.reload();
			}
			if (cb) {
				cb(successful);
			}
		}
	}, frequency);
}

/**
 * continually calls the given method until successful
 * Promisified for use with async/await
 * @param {Function}   method         should return true when successful, or false when we should give up early
 * @param {bool}       silenceErrors  true if we should not alert on errors
 * @param {Function}   cb             to be called with the results from method when we're done trying
 */
function keepTryingAsPromised(method, silenceErrors) {
	return new Promise((resolve, reject) => {
		keepTrying(method, silenceErrors, (successful) => {
			resolve(successful);
		});
	});
}