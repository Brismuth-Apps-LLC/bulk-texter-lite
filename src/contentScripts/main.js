const siteIsGoogleVoice = window.location.href.startsWith('https://voice.google.com');
let siteManager; // globally available

// all of the selectors used for automation
const selectors = {
	// google voice (in cases where there are two selectors, it is to support newer versions to older versions, left to right)
	gvMessagesTab: 'a[aria-label^="Message"][role="tab"], div[aria-label^="Message"][role="tab"]',
	gvNumInputButton: 'div[gv-id="send-new-message"]',
	gvNumInput: 'gv-recipient-picker input[ng-show="ctrl.allowToAddRecipients()"], gv-recipient-picker input[placeholder="Type a name or phone number"]',
	gvStartChatButton: 'gv-contact-list div[ng-class="::ctrl.CSS.SEND_TO_PHONE_NUMBER"]',
	gvRecipientButton: 'div[aria-label="Select recipients"] .mat-chip-list-wrapper gmat-input-chip[gv-id="chip-phone-number"], div[aria-label="Select recipients"] md-chips md-chip button',
	gvMessageEditor: 'textarea[aria-label="Type a message"], #gv-message-input, div[gv-test-id="gv-message-input"]',
	gvSendButtonOld: 'gv-icon-button[icon-name="send"] button[aria-label="Send message"]',
	gvSendButtonNew: 'gv-icon-button-ng2[icon-name="send"][label="Send message"] button',
	gvSendingNote: 'gv-message-item div[ng-if="ctrl.shouldDisplayTransmissionStatus()"] div[ng-if="!ctrl.isFailed()"]',
	gvMostRecentMessages: 'div[gv-id="content"] div[gv-test-id="bubble"] gv-annotation',
	gvChatLoadedHeader: 'gv-message-list-header p[gv-test-id="conversation-title"]',

	// hangouts
	hangoutsProfilePictureSelector: 'div[aria-label="Change profile picture"]',
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
	// this only shows up in the hangouts iframe on gmail.com, which is not currently supported
	var isOnGmail = document.querySelector(selectors.hangoutsProfilePictureSelector);
	if (button && !isOnGmail) {
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
