/**
 * There are two components for hangouts messaging, the HangoutsListViewManager and the HangoutsThreadViewManager.
 * The HangoutsListViewManager runs on the Hangouts conversation listview.
 * The HangoutsThreadViewManager runs on the Hangouts thread.
 * These communicate via the chrome runtime message system because they are in separate iframes.
 */
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
			source: 'GVBT_HANGOUTS',
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