const siteIsGoogleVoice = window.location.href.startsWith('https://voice.google.com');
let siteManager; // globally available

// all of the selectors used for automation
const selectors = {
	// google voice (in cases where there are two selectors, it is to support newer versions to older versions, left to right)
	gvMessagesTab: 'a[gv-test-id="sidenav-messages"]',
	gvNumInputButton: 'div[gv-id="send-new-message"]',
	gvNumInput: 'gv-recipient-picker input[ng-show="ctrl.allowToAddRecipients()"], gv-recipient-picker input[placeholder="Type a name or phone number"]',
	gvStartChatButton: 'gv-contact-list div[ng-class="::ctrl.CSS.SEND_TO_PHONE_NUMBER"]',
	gvRecipientButton: 'gmat-input-chip[gv-id="chip-phone-number"], div[aria-label="Select recipients"] md-chips md-chip button',
	gvMessageEditor: 'textarea[gv-test-id="gv-message-input"], textarea[aria-label="Type a message"], textarea[aria-label="Add a caption"], #gv-message-input, div[gv-test-id="gv-message-input"]',
	gvSendButtonOld: 'gv-icon-button[icon-name="send"] button[aria-label="Send message"]',
	gvSendButtonNew: 'gv-icon-button-ng2[gv-test-id="send_message"] button, gv-icon-button-ng2[icon-name="send"][label="Send message"] button',
	gvSendingNote: 'gv-message-item div[ng-if="ctrl.shouldDisplayTransmissionStatus()"] div[ng-if="!ctrl.isFailed()"]',
	gvMostRecentMessages: 'div[gv-id="content"] div[gv-test-id="bubble"] gv-annotation, gv-text-message-item gv-annotation',
	gvChatLoadedHeader: 'gv-message-list-header p[gv-test-id="conversation-title"]'
};

/********************************************************************************************************
********* Identifies whether we're on voice.google.com, configures appropriately ************************
********************************************************************************************************/
keepTrying(findGoogleVoice, true);

function findGoogleVoice() {
	// stop looking, wrong url
	if (!window.location.href.includes('/webchat/') && !window.location.href.startsWith('https://voice.google.com')) {
		return false;
	}

	// check if this is the google voice site
	var button = document.querySelector(selectors.gvMessagesTab);
	if (button && siteIsGoogleVoice) {
		console.log('Bulk Texter Lite - configuring google voice site');
		siteManager = new GoogleVoiceSiteManager();
		siteManager.initialize();
		return true;
	}
}
