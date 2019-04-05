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
				response(url.startsWith('https://hangouts.google.com/') ? 'HANGOUTS' : false);
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
		if (Object.keys(this.messagesToSend).length < 1) {
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
			source: 'GVBT_HANGOUTS',
			type: 'SEND_MESSAGE',
			number: number,
			message: this.messagesToSend[number]
		});

		delete this.messagesToSend[number];
	}
}
