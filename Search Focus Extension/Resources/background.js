browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	if (request.page === 'check') {
		sendResponse({ page: 'loaded' });
	}
});
