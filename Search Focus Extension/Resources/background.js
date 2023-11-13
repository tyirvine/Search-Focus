// Store the content script's tab ID.
let contentTabId;

// Any messages received here are sent to the content script.
browser.runtime.onMessage.addListener((received, sender) => {
	// Save the content script's tab ID.
	if (received.message === 'loaded') {
		contentTabId = sender.tab.id;
	}
	browser.tabs.sendMessage(contentTabId, received);
});

window.onload = async () => {
	await initialize();
};

async function initialize() {
	let settings = { isDisabled: false, navStyle: 'arrows' };

	// Initialize the settings if they're empty.
	let settingsInStorage = (await browser.storage.local.get('settings')).settings;
	if (Object.keys(settingsInStorage).length === 0) {
		await browser.storage.local.set({ settings });
	}
}
