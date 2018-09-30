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
			if (chatSwitched) {
				that.sendMessage();
			}
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
		if (Object.keys(this.messagesToSend).length < 1) {
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
