/**
 * removes all non-numeric characters from the number string
 * @param  {string}   number i.e. (123) 456-7890
 * @return {string}         i.e. 1234567890
 */
function formatNumber(number) {
	return number.replace(/\D/g,'');
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
	const frequency = 500; // try every 500ms
	let tryCount = 5 * 1000/frequency; // keep trying for 5 seconds
	var keepTryingInterval = setInterval(function() {
		var successful = method();
		var giveUp = successful === false || tryCount-- < 0;
		if (successful === true || giveUp) {
			clearInterval(keepTryingInterval);
			// the app failed
			if (!silenceErrors && tryCount < 1) {
				if (siteIsGoogleVoice) {
					showFatalError(`Make sure you haven't enabled texting via Hangouts, as that will disable sending messages via the Google Voice app.\n\nIf the error persists, please send this error code to the developer.\n\nError: "${getFunctionName(method)}" failed.`, true);
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
	return new Promise((resolve, reject) => {
		keepTrying(method, silenceErrors, (successful) => {
			resolve(successful);
		});
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