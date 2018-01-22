/**
 * Sends message to the content script to search for the hangouts elements and send messages
 */
function sendMessages(messages) {
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {from: 'popup', type: 'SEND_MESSAGES', messages: messages});
	});
}

/**
 * formatMessages
 * @param  {string} numbersAndNames   comma separated numbers and names split up with newlines
 * @param  {string} message           message with name piped in like "Hey {name}, this is a test."
 * @return {array}                    array of message objects like {number: '(123)-456-7890', message: "Hey John, this is a test."}
 */
function formatMessages(numbersAndNames, message) {
	var messages = {};
	var queue = [];
	var contacts = numbersAndNames.split('\n');
	contacts.forEach(function(contact) {
		var contactDetails = contact.split(',');
		if (contactDetails.length === 2) {
			var number = formatNumber(contactDetails[0]);
			var formattedMessage = message.replace("{name}", contactDetails[1]);
			messages[number] = formattedMessage;
			queue.push(number);
		} else {
			console.error("Incorrect contact format: " + contactDetails);
		}
	});

	return {
		messages,
		queue
	};
}

/**
 * removes all non-numeric characters from the number string
 * @param  {string} number   i.e. (123) 456-7890
 * @return {string}          i.e. 1234567890
 */
function formatNumber(number) {
	return number.replace(/\D/g,'');
}

// configure popup button event listener
document.addEventListener('DOMContentLoaded', () => {
	var sendMessagesButton = document.getElementById('SendMessagesButton');
	var numbersAndNames = document.getElementById('NumbersAndNames');
	var message = document.getElementById('Message');

	sendMessagesButton.addEventListener('click', () => {
		var messages = formatMessages(numbersAndNames.value, message.value);
		sendMessages(messages);
	});
});
