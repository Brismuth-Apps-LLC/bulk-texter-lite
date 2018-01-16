// This part isn't working
// https://stackoverflow.com/questions/42638172/how-can-i-simulate-keys-entered-in-an-input-web-element-in-chrome-56-with-pure-j
// https://stackoverflow.com/questions/13987380/how-to-to-initialize-keyboard-event-with-given-char-keycode-in-a-chrome-extensio/34722970#34722970
// https://stackoverflow.com/questions/35265666/keydown-which-not-working-chrome-extension

chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	if(message.action === 'pressSpace'){
		chrome.tabs.query({active: true}, function(tabs) {
			console.log('background: sending');
			chrome.debugger.attach({ tabId: tabs[0].id }, "1.0");
			chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { type: 'keyUp', windowsVirtualKeyCode:32, nativeVirtualKeyCode : 32, macCharCode: 32, code: "Space", key: ' '  });
			chrome.debugger.sendCommand({ tabId: tabs[0].id }, 'Input.dispatchKeyEvent', { type: 'keyDown', windowsVirtualKeyCode:32, nativeVirtualKeyCode : 32, macCharCode: 32, code: "Space", key: ' '  });
			chrome.debugger.detach({ tabId: tabs[0].id });
		});
	}
});
