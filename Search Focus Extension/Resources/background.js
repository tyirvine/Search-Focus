// The application ID of the native Safari extension.
let applicationID = 'tyirvine.Search-Focus.Extension';

// Receives the message from the content script and sends it to the native app.
browser.runtime.onMessage.addListener((received, sender) => {
	let message = { message: received.message, sender: sender };
	browser.tabs.sendMessage(sender.tab.id, { message: message });
});
