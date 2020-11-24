let installationID;

// For logging
chrome.runtime.onMessage.addListener(function (message, sender, response) {
	if (message.gvbt_logger === true) {
		console.log(message.payload);
	}
	if (message.payload && message.payload.eventLabel === 'MESSAGE_SENT') {
		recordMessageSent();
	}
});

chrome.storage.sync.get('installationID', function(items) {
	if (items.installationID) {
		installationID = items.installationID;
	} else {
		installationID = uuidv4();
		chrome.storage.sync.set({
			installationID
		});
	}
});

/**
 * Records the message count sent by month
 * @return {[type]} [description]
 */
recordMessageSent = () => {
	chrome.storage.sync.get('sendCounts', function(items) {
		items.sendCounts = items.sendCounts || {};
		const thisMonth = getYearAndMonth(new Date());
		const thisMonthCount = (items.sendCounts[thisMonth] || 0) + 1;
		const sendCounts = {
			...items.sendCounts,
			[thisMonth]: thisMonthCount
		};
		chrome.storage.sync.set({
			sendCounts
		});

		const manifest = chrome.runtime.getManifest();

		fetch('https://api.brismuth.com/gvbt/sendCounts', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			referrerPolicy: 'no-referrer',
			body: JSON.stringify({
				"InstallationID": installationID,
				"MessagesSent": sendCounts,
				"ExtensionVersion": manifest.version
			})
		});
	});
}

/**
 * Takes a date and returns the Year and month, like 2019-03
 * @param  {Date} date
 * @return {string}      year and month
 */
function getYearAndMonth(date) {
	return date.getFullYear() + '-' + ("0" + (date.getMonth() + 1)).slice(-2)
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}