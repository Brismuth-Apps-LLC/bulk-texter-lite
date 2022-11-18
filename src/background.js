// Microsoft Edge compatibility
if (chrome == null) {
	chrome = browser;
}

// For logging
chrome.runtime.onMessage.addListener(function (message, sender, response) {
	if (message.gvbt_logger === true) {
		console.log(message.payload);
	}
	if (message.eventType === 'MESSAGE_SENT') {
		recordMessageSent();
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

		chrome.storage.sync.set({
			sendCounts: {
				...items.sendCounts,
				[thisMonth]: thisMonthCount
			}
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
