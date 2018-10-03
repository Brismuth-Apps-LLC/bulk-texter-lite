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
			
			let sendExecutionQueue = this.getSendExecutionQueue();
			while (sendExecutionQueue.length) {
				let currentStep = sendExecutionQueue.shift().bind(this);
				const result = await keepTryingAsPromised(currentStep, silenceErrors);
				if (!result) {
					console.log(`Bulk SMS - Step failed (${getFunctionName(currentStep)}), retrying message.`);
					silenceErrors = false; // if this happens again, alert on it
					
					// start over in the execution queue
					sendExecutionQueue = this.getSendExecutionQueue();
				}
			}
		}
	}

	getSendExecutionQueue() {
		return [
			this.showNumberInput,
			this.fillNumberInput,
			this.startChat,
			this.confirmChatSwitched,
			this.writeMessage,
			this.sendMessage,
			this.confirmSent
		];
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
		const recipientButton = document.querySelector(selectors.recipientButton);
		if (recipientButton && recipientButton.offsetParent !== null) {
			var number = formatNumber(recipientButton.innerText);
			return numberToSend === number;
		}
	}

	writeMessage() {
		const number = this.currentNumberSending;
		if (!this.messagesToSend[number]) {
			return false;
		}
	
		const message = this.messagesToSend[number];
	
		var messageEditor = document.querySelector(selectors.gvMessageEditor);
		
		if (messageEditor.value) {
			console.log('Bulk SMS - Already had value:', messageEditor.value);
			return;
		}
		
		if (messageEditor && messageEditor.offsetParent !== null) {
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
		if (sendButton && sendButton.offsetParent !== null) {
			sendButton.click();
			return true;
		}
	}

	confirmSent() {
		let sendingNote = document.querySelector(selectors.gvSendingNote);

		if (!sendingNote) { // this is the note that says "Sending", it will disappear when it is finished
			// continue with queue
			setTimeout(this.sendFromQueue.bind(this), 500);
			return true;
		}
	}
}
