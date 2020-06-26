/**
 * removes all non-numeric characters from the number string
 * @param  {string}   number i.e. +1 (223) 456-7890
 * @return {string}         i.e. 2234567890
 */
function formatNumber(number) {
	var simplifiedNumber = number.trim().replace(/\D/g,'');
	// remove international code for US numbers
	if (simplifiedNumber.length === 11 && simplifiedNumber.charAt(0) === '1') {
		simplifiedNumber = simplifiedNumber.substr(1);
	}
	return simplifiedNumber;
}

function getFunctionName(func) {
	return func.name.replace(/bound /g, '');
}

/**
 * continually calls the given method until successful
 * @param {Function}   method         should return true when successful, or false when we should give up early
 * @param {bool}       silenceErrors  true if we should not alert on errors
 * @param {Function}   cb             to be called with the results from method when we're done trying
 */
function keepTrying(method, silenceErrors, cb) {
	const frequency = 100; // try every 100ms
	let tryCount = 5 * 1000/frequency; // keep trying for 5 seconds
	var keepTryingInterval = setInterval(function() {
		var successful = method();
		var giveUp = successful === false || tryCount-- < 0;
		if (successful === true || giveUp) {
			clearInterval(keepTryingInterval);
			// the app failed
			if (!silenceErrors && giveUp) {
				if (siteIsGoogleVoice) {
					showFatalError(`You can find support resources by opening the Google Voice Bulk Texter popup and clicking "Get Help" at the bottom.\n\nError: "${getFunctionName(method)}" failed.`, true);
				} else {
					showFatalError('Are you sure Google Voice texting via Hangouts is enabled?\nAlso, be aware that this extension is not compatible with the Google Hangouts Chrome extension. If you have the Hangouts extension installed you\'ll need to temporarily disable it.', false);
				}
			}
			if (cb) {
				cb(successful);
			}
		}
	}, frequency);
}

/**
 * continually calls the given method until successful
 * Promisified for use with async/await
 * @param {Function}   method         should return true when successful, or false when we should give up early
 * @param {bool}       silenceErrors  true if we should not alert on errors
 * @param {Function}   cb             to be called with the results from method when we're done trying
 */
function keepTryingAsPromised(method, silenceErrors) {
	console.log('Bulk SMS - Running: ', getFunctionName(method));
	const waitTime = 400; // 400ms
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			keepTrying(method, silenceErrors, (successful) => {
				resolve(successful);
			});
		}, waitTime);
	});
}

/**
 * shows the message as an alert, reloads the page if instructed to
 * @param {*} message
 * @param {*} reload
 */
function showFatalError(message, reload) {
    if (siteManager) {
        siteManager.messagesToSend.length = 0;
    }
    const manifest = chrome.runtime.getManifest();
	const reloadMessage = '\n\nWhen you click "ok" the page will refresh.';
	const fullMessage = `Google Voice bulk texter v${manifest.version}:\nText failed. ${message} ${reload ? reloadMessage : ''}`;
	console.error('Bulk SMS - ' + fullMessage);
	alert(fullMessage);
    if (reload) {
        window.location.reload();
    }
}

/**
 * Sends a message to background.js for storage (usage tracking for future user-visible dashboards, and anonymous data for developer)
 * @param  {object} payload  value to be logged
 */
function logEvent(payload) {
	chrome.runtime.sendMessage({
		gvbt_logger: true,
		payload: payload
	});
}

/**
 * Removes unicode characters from the text
 */
function removeUnicode(text) {
	return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
}

/**
 * Removes whitespace from the text
 */
function removeWhitespace(text) {
	return text.replace(/\s/g,'');

}