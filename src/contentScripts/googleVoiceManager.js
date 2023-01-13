// Microsoft Edge compatibility
if (chrome == null) {
	chrome = browser;
}

/**
 * This runs on voice.google.com
 */
class GoogleVoiceSiteManager {
	constructor() {
		this.messagesToSend = {};
		this.sendInterval = 5000;
		this.numberQueue = [];
		this.currentNumberSending = '';
	}

	initialize() {
		chrome.runtime.onMessage.addListener((message, sender, response) => {
			if (message.from === 'popup' && message.type === 'SEND_MESSAGES') {
				this.addMessagesToQueue(message.messages);
				this.sendInterval = message.sendInterval;

				this.sendFromQueue();
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
		let retryCount = 5;

		if (this.numberQueue.length > 0) {
			this.currentNumberSending = this.numberQueue.shift();

			let sendExecutionQueue = this.getSendExecutionQueue();
			while (sendExecutionQueue.length) {
				let currentStep = sendExecutionQueue.shift().bind(this);
				const result = await keepTrying(currentStep, retryCount > 0);
				if (getFunctionName(currentStep) === 'sendMessage') {
					// we only try the sendMessage step once, no matter the result, to avoid the chance of duplicate messages.
					sendExecutionQueue.length = 0; // reset the send queue
					setTimeout(this.sendFromQueue.bind(this), this.sendInterval); // continue with next message
				} else if (!result) { // retry
					console.log(`Bulk Texter Lite - Step failed (${getFunctionName(currentStep)}), retrying message.`);
					retryCount--; // if this keeps happening, alert on it
					sendExecutionQueue = this.getSendExecutionQueue();
				}
			}
		}
	}

	getSendExecutionQueue() {
		return [
			this.switchToMessagesTab,
			this.showNumberInput,
			this.fillNumberInput,
			this.startChat,
			this.confirmChatSwitched,
			this.writeMessage,
			this.sendMessage
		];
	}

	switchToMessagesTab() {
		const messagesTabButton = document.querySelector(selectors.gvMessagesTab);
		if (messagesTabButton && messagesTabButton.offsetParent !== null) {
			messagesTabButton.click();
			return true;
		} else {
			const messagesTabButtonBackup = document.querySelector('a[aria-label^="Message"][role="tab"]');
			if (messagesTabButtonBackup && messagesTabButtonBackup.offsetParent !== null) {
				messagesTabButtonBackup.click();
				return true;
			}
		}
	}

	showNumberInput() {
		var showInputButton = document.querySelector(selectors.gvNumInputButton);
		if (showInputButton && showInputButton.offsetParent !== null) {
			showInputButton.click();
			return true;
		}
	}

	fillNumberInput() {
		let numInput = document.querySelector(selectors.gvNumInput);
		if (numInput && numInput.offsetParent !== null) {
			numInput.value = this.currentNumberSending;

			// this fires the necessary events for Google Voice to pick up
			numInput.focus();
			numInput.select();
			document.execCommand('cut');
			document.execCommand('paste');

			// confirm that the number was added as expected
			let numInputConfirm = document.querySelector(selectors.gvNumInput);
			return numInputConfirm && numInputConfirm.value === this.currentNumberSending;
		}
	}

	// clicks the "start SMS" button on the number dropdown
	startChat() {
		var startChatButton = document.querySelector(selectors.gvStartChatButton);
		if (startChatButton && startChatButton.offsetParent !== null) {
			startChatButton.click();
			return true;
		}
	}

	confirmChatSwitched() {
		const numberToSend = this.currentNumberSending;
		const recipientButton = document.querySelector(selectors.gvRecipientButton);
		if (recipientButton && recipientButton.offsetParent !== null) {
			const label = recipientButton.getAttribute('aria-label');
			if (label && label.replaceAll(' ','').indexOf(numberToSend) >= 0) {
				return true;
			}
		}

		return false;
	}

	writeMessage() {
		const number = this.currentNumberSending;
		if (!this.messagesToSend[number]) {
			return false;
		}

		const message = this.messagesToSend[number];
		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		if (messageEditor && messageEditor.offsetParent !== null) {
			// support both div and textarea
			messageEditor.value = message;
			messageEditor.innerText = message;
			return true;
		}
	}

	sendMessage() {
		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		if (!messageEditor) {
			return;
		}

		messageEditor.focus();
		if (messageEditor.select) {
			messageEditor.select();
		} else {
			document.execCommand('selectAll',false,null)
		}
		document.execCommand('cut');
		document.execCommand('paste');

		// click send button
		let sendButtonOld = document.querySelector(selectors.gvSendButtonOld);
		let sendButtonNew = document.querySelector(selectors.gvSendButtonNew);
		if (sendButtonOld && sendButtonOld.offsetParent !== null && sendButtonOld.getAttribute('aria-disabled') === 'false') {
			sendButtonOld.click();
			return true;
		}
		if (sendButtonNew && sendButtonNew.offsetParent !== null && sendButtonNew.disabled === false) {
			sendButtonNew.dispatchEvent(new Event('mousedown'));
			sendButtonNew.dispatchEvent(new Event('mouseup'));
			sendButtonNew.click();
			return true;
		}
	}
}
