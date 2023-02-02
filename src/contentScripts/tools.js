// Microsoft Edge compatibility
if (chrome == null) {
  chrome = browser;
}

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
 * Promisified for use with async/await
 * @param {Function}   method         should return true when successful, or false when we should give up early
 * @param {bool}       silenceErrors  true if we should not alert on errors
 * @param {Function}   cb             to be called with the results from method when we're done trying
 */
async function keepTrying(method, silenceErrors) {
  const methodName = getFunctionName(method);
  function fatalErrorHandler() {
    if (!silenceErrors) {
      const manifest = chrome.runtime.getManifest();
      const fullMessage = `Bulk Texter Lite v${manifest.version}:\nText failed. "${methodName}" failed.\n\nYou can find support resources by opening the Bulk Texter Lite popup and clicking "Get Help" at the bottom.\n\nWhen you click "ok" the page will refresh.`;
      
      if (siteManager) {
        siteManager.messagesToSend.length = 0;
      }
      console.error(fullMessage);
      alert(fullMessage);
      window.location.reload();
    }
  }

  console.log('BulkTexterLite: Running: ', methodName);
  const frequency = 300; // try every 200ms
  let tryCount = 5 * 1000/frequency; // keep trying for 5 seconds
  
  while (tryCount-- > 0) {
    await sleep(frequency);

    if (methodName === 'sendMessage') {
      await sleep(2000); // to make sure Google Voice has time to switch threads for MMS
    }

    let successful = method();
    if (successful === true) {
      return true;
    }

    let giveUp = successful === false;
    if (giveUp) {
      fatalErrorHandler();
      return successful;
    }
  }

  fatalErrorHandler();
  return false;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
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

const simulateKeyPress = (element) => {
  element.dispatchEvent(new Event('change', {
    bubbles: true,
    cancelable: true
  }));
}