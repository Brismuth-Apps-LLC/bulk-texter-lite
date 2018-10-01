const siteIsGoogleVoice = window.location.href.startsWith('https://voice.google.com');
let siteManager; // globally available 

// all of the selectors used for automation
const selectors = {
	// google voice
	gvMessagesTab: 'div[aria-label^="Message"][role="tab"]',
	gvNumInputButton: 'div[gv-id="send-new-message"]',
	gvNumInput: 'gv-recipient-picker input[placeholder="Type a name or phone number"]',
	gvStartChatButton: 'gv-contact-list div[ng-class="::ctrl.Css.SEARCH_LIST"] div[ng-class="[\'md-body-1\', ctrl.Css.SEND_TO_PHONE_NUMBER]"]',
	recipientButton: 'div[aria-label="Select recipients"] md-chips md-chip button',
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
		siteManager = new GoogleVoiceSiteManager();
		siteManager.initialize();
		return true;
	}

	// check if this is the hangouts conversation list
	var button = document.querySelector(selectors.hangoutsNumInputButton);
	if (button) {
		console.log('Bulk SMS - configuring list view');
		siteManager = new HangoutsListViewManager();
		siteManager.initialize();
		return true;
	}

	// check if this is the hangouts message editor
	var messageEditor = document.querySelector(selectors.hangoutsMessageEditor);
	if (messageEditor) {
		console.log('Bulk SMS - configuring thread');
		siteManager = new HangoutsThreadViewManager();
		siteManager.initialize();
		return true;
	}
}
