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
		let silenceErrors = true;

		if (this.numberQueue.length > 0) {
			this.currentNumberSending = this.numberQueue.shift();
			
			let sendExecutionQueue = [
				this.showNumberInput,
				this.fillNumberInput,
				this.startChat,
				this.confirmChatSwitched,
				this.writeMessage,
				this.sendMessage
			];
			
			let previousStep;
			while (sendExecutionQueue.length) {
				let currentStep = sendExecutionQueue.shift().bind(this);
				const result = await keepTryingAsPromised(currentStep, silenceErrors);
				if (!result) {
					console.log(`Bulk SMS - Step failed (${getFunctionName(currentStep)}), going back to previous step (${getFunctionName(previousStep)}).`);
					silenceErrors = false; // if this happens again, alert on it
					// try the last two steps again
					sendExecutionQueue.unshift(currentStep);
					sendExecutionQueue.unshift(previousStep);
				} else {
					previousStep = currentStep;
				}
			}
		}
	}

	showNumberInput() {
		var showInputButton = document.querySelector(selectors.gvNumInputButton);
		if (showInputButton) {
			showInputButton.click();
			return true;
		}
	}

	fillNumberInput() {
		let numInput = document.querySelector(selectors.gvNumInput);
		if (numInput) {
			numInput.value = this.currentNumberSending;

			// this fires the necessary events for Google Voice to pick up
			numInput.focus();
			numInput.select();
			document.execCommand('cut');
			document.execCommand('paste');
		
			// confirm that the number was added as expected
			let numInputConfirm = document.querySelector(selectors.gvNumInput);
			return numInputConfirm.value === this.currentNumberSending;
		}
	}

	// clicks the "start SMS" button on the number dropdown
	startChat() {
		var startChatButton = document.querySelector(selectors.gvStartChatButton);
		if (startChatButton) {
			startChatButton.click();
			return true;
		}
	}

	confirmChatSwitched() {
		const numberToSend = this.currentNumberSending;
		const expandRecipients = document.querySelector(selectors.gvExpandRecipientButton);
		if (expandRecipients) {
			expandRecipients.click();
			var numberElem = document.querySelector(selectors.gvRecipientNumber);
			if (numberElem) {
				var number = numberElem.innerText.trim().replace(/\D/g,'');
				return numberToSend === number;
			}
		}
	}

	writeMessage() {
		const number = this.currentNumberSending;
		if (!this.messagesToSend[number]) {
			return false;
		}
	
		const message = this.messagesToSend[number];
	
		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		if (messageEditor) {
			messageEditor.value = message;
			return true;
		}
	}

	sendMessage() {
		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		if (!messageEditor) {
			return;
		}

		messageEditor.focus();
		messageEditor.select();
		document.execCommand('cut');
		document.execCommand('paste');

		// click send button
		let sendButton = document.querySelector(selectors.gvSendButton);
		if (sendButton) {
			sendButton.click();
			
			// continue with queue
			setTimeout(this.sendFromQueue.bind(this), 300);
			
			return true;
		}
	}
}
