document.addEventListener('visibilitychange', async () => {
	updateInterface(await getSettings());
});

window.onload = async () => {
	updateInterface(await getSettings());
};

// Sends messages to the background script to update the settings.
// Listen for the pause resume button press.
document.getElementById('setting-pause-resume-button').addEventListener('click', async (event) => {
	let settings = await getSettings();
	settings.isDisabled = !settings.isDisabled;
	update(settings);
});

// Listen for the navigation style toggle change.
document.getElementById('setting-navigation-style-toggle').addEventListener('change', async (event) => {
	let navStyleToggle = document.getElementById('setting-navigation-style-toggle');
	let settings = await getSettings();
	settings.navStyle = navStyleToggle.value;
	update(settings);
});

// Updates the popup state and relays the changes to the background script.
function update(settings) {
	updateSettings(settings);
	updateInterface(settings);
	browser.runtime.sendMessage({ message: 'settings' });
}

// Retrieves the settings from the localStorage. If they don't exist, get the default settings.
async function getSettings() {
	return (await browser.storage.local.get('settings')).settings;
}

// Updates the settings in the localStorage.
async function updateSettings(settings) {
	await browser.storage.local.set({ settings });
}

// Updates the settings elements in the popup.
function updateInterface(settings) {
	updateSettingPauseResumeButton(settings.isDisabled);
	updateSettingNavigationStyleToggle(settings.navStyle);
}

function updateSettingPauseResumeButton(isDisabled) {
	let pauseResumeButton = document.getElementById('setting-pause-resume-button');
	if (isDisabled) {
		pauseResumeButton.innerHTML = 'Enable 🔍';
	} else {
		pauseResumeButton.innerHTML = 'Disable ✋';
	}
}

function updateSettingNavigationStyleToggle(navStyle) {
	let navStyleToggle = document.getElementById('setting-navigation-style-toggle');
	navStyleToggle.value = navStyle;
}
