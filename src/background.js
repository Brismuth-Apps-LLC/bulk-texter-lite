// For logging
chrome.runtime.onMessage.addListener(function (message, sender, response) {
	if (message.gvbt_logger === true) {
		recordAnalyticsPayload(message.payload);
	}
	if (message.eventType === 'MESSAGE_SENT') {
		recordMessageSent();
	}
});

/**
 * records the payload to google analytics. Requires eventLabel and eventValue to be set
 * @param  {object} payload
 */
recordAnalyticsPayload = (payload) => {
	if (payload.hitType !== 'pageview') {
		payload.hitType = payload.hitType || 'event';
		payload.eventCategory = payload.eventCategory || 'Messaging Popup';
		payload.eventAction = payload.eventAction || 'event';
	}

	ga('send', payload);
}

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

/* google analytics */
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-50081113-4', 'auto');
ga('set', 'checkProtocolTask', function(){}); // Removes failing protocol check. @see: http://stackoverflow.com/a/22152353/1958200

// Hangouts integration only - this acts as a proxy for the content scripts in the different iframes to talk to each other
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	if (message.source === 'GVBT_HANGOUTS') {
		chrome.tabs.sendMessage(sender.tab.id, message, function(response) {});
	}
});
