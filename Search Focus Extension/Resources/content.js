/* ------------------------------- Entry Point ------------------------------ */
var settings;

// Sends a message to background.js to let it know that the content script has loaded.
browser.runtime.sendMessage({ message: 'loaded' });

// Receives a message from background.js to signal that the extension has been updated.
browser.runtime.onMessage.addListener(async (received) => {
	// Updates the settings from the local storage.
	settings = (await browser.storage.local.get('settings')).settings;

	// Updates the links.
	if (received.message === 'loaded') {
		setup();
	}
});

/* ---------------------------------- State --------------------------------- */

class State {
	#isPaused = true;
	#currentLinkIndex = 0;
	#previousLinkIndex = -1;
	#currentLink;
	#allLinks;

	getIsPaused() {
		if (settings.isDisabled) {
			return true;
		}
		return this.#isPaused;
	}

	setIsPaused(bool) {
		if (settings.isDisabled) {
			this.#isPaused = true;
			return;
		}
		this.#isPaused = bool;
	}

	getUpKey() {
		switch (settings.navStyle) {
			case 'arrows':
				return 'ArrowUp';

			case 'jk':
				return 'k';

			default:
				break;
		}
	}

	getDownKey() {
		switch (settings.navStyle) {
			case 'arrows':
				return 'ArrowDown';

			case 'jk':
				return 'j';

			default:
				break;
		}
	}

	getCurrentLinkIndex() {
		return this.#currentLinkIndex;
	}

	getCurrentLink() {
		return this.#currentLink;
	}

	setCurrentLink(link) {
		this.#currentLink = link;
	}

	clickCurrentLink() {
		this.#currentLink.click();
	}

	setAllLinks(links) {
		this.#allLinks = links;
	}

	selectPreviousLinkIndex() {
		if (this.#currentLinkIndex > 0) {
			this.#currentLinkIndex--;
		}
	}

	selectNextLinkIndex() {
		if (this.#currentLinkIndex < this.#allLinks.length - 1) {
			this.#currentLinkIndex++;
		}
	}

	isNewLinkSelected() {
		if (this.#currentLinkIndex !== this.#previousLinkIndex) {
			this.#previousLinkIndex = structuredClone(this.#currentLinkIndex);
			return true;
		} else {
			return false;
		}
	}
}

/* -------------------------------- Handlers -------------------------------- */

function setup() {
	// Create a new state object.
	let state = new State();

	// Handle focus changes.
	handleDocumentFocusChange(state);
	handlePageFocusChange(state);
	handleInputFocusChange(state);

	// Update the links if the page resizes.
	handleResize(state);

	// Update the links when there's a key press.
	handleKeyPress(state);

	// Grab all the links on the page and apply styles to them.
	updateLinks(state, false);
}

function handleResize(state) {
	const resizeObserver = new ResizeObserver(() => {
		updateLinks(state);
	});

	resizeObserver.observe(document.body);
}

function handleKeyPress(state) {
	addEventListener(
		'keydown',
		(event) => {
			// Route the key press.
			switch (event.key) {
				// Down navigation.
				case state.getDownKey():
					navigate('down', event, state);
					break;

				// Up navigation.
				case state.getUpKey():
					navigate('up', event, state);
					break;

				default:
					break;
			}
		},
		true
	);

	addEventListener(
		'keyup',
		(event) => {
			// Route the key press.
			switch (event.key) {
				// Select the link.
				case 'Enter':
					state.clickCurrentLink();
					break;

				// Remove all highlights.
				case 'f':
					pauseExtension(state);
					break;

				// Toggle the extension with a shift modifier. Otherwise, resume.
				case 'Escape':
					if (event.shiftKey) {
						toggleExtension(state);
						break;
					}
					resumeExtension(state);
					break;

				default:
					break;
			}
		},
		true
	);
}

// Resumes the extension if the page is focused.
function handlePageFocusChange(state) {
	document.addEventListener('visibilitychange', () => {
		resumeExtension(state);
	});
}

// Pauses and resumes the extension when an input changes focus.
function handleInputFocusChange(state) {
	document.addEventListener('focusin', (event) => {
		pauseExtension(state);
	});
	document.addEventListener('focusout', (event) => {
		resumeExtension(state);
	});
}

// This handles changes in focus to the webpage itself.
// For example, if the browser search bar is activated, this will detect a loss of focus of the page.
// Causing the extension to be paused.
function handleDocumentFocusChange(state) {
	detectDocumentFocusChange(state);

	window.addEventListener('focus', function () {
		detectDocumentFocusChange(state);
	});

	window.addEventListener('blur', function () {
		detectDocumentFocusChange(state);
	});
}

function detectDocumentFocusChange(state) {
	// Only capture focus changes if they're new.
	// Check to make sure no text inputs are focused.
	let textInputs = document.querySelectorAll('textarea, input');
	let doesInputHaveFocus = false;

	for (let i = 0; i < textInputs.length; i++) {
		let input = textInputs[i];
		if (document.activeElement === input) {
			doesInputHaveFocus = true;
			break;
		}
	}

	// We only resume if the webpage has focus and if no text inputs are focused.
	if (document.hasFocus() && !doesInputHaveFocus) {
		resumeExtension(state);
	} else {
		pauseExtension(state);
	}
}

/* ------------------------------ Sub-routines ------------------------------ */

function select(state) {
	if (!state.getIsPaused()) {
		state.clickCurrentLink();
	}
}

function navigate(direction, event, state) {
	// If the extension is paused, don't do anything.
	// As well, don't do anything if there's no link selected.
	if (state.getIsPaused() || !state.getCurrentLink()) {
		return;
	}

	// Prevent the default behavior of the key press.
	event.preventDefault();

	// Route the direction.
	if (direction === 'up') {
		state.selectPreviousLinkIndex();
	} else if (direction === 'down') {
		state.selectNextLinkIndex();
	}

	event.stopPropagation();

	updateLinks(state);
}

function pauseExtension(state) {
	state.setIsPaused(true);
	clearLinkHighlights();
}

function resumeExtension(state) {
	state.setIsPaused(false);
	updateLinks(state, false);
}

function toggleExtension(state) {
	if (state.getIsPaused()) {
		resumeExtension(state);
	} else {
		pauseExtension(state);
	}
}

function updateLinks(state, scroll = true) {
	// If the extension is paused, don't do anything.
	if (state.getIsPaused()) {
		return;
	}

	// Run the update on the links.
	let links = grabLinks();
	links.forEach((link, index) => {
		// If this isn't the current link continue.
		// Remove highlighting if any from the link.
		if (index !== state.getCurrentLinkIndex()) {
			link.classList.remove('linkSelector');
			return;
		}

		// Highlight the current link.
		link.classList.add('linkSelector');

		// Store the current link and all links.
		state.setCurrentLink(link);
		state.setAllLinks(links);

		// Scroll the current link into view if it's a new link.
		if (state.isNewLinkSelected(index) && scroll) {
			link.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	});
}

function clearLinkHighlights() {
	let links = grabLinks();
	links.forEach((link) => {
		link.classList.remove('linkSelector');
	});
}

function grabLinks() {
	// Our selectors to grab only the first-layer web-links on the search page.
	// We don't want to grab the links in the "People also ask" section.
	// We also don't want to grab the links in the "Images for ..." section.
	let selectorMainLinks = '#center_col a:has(h3):not(div[data-initq] a):not(title-with-lhs-icon > a)';
	let selectorSubLinks = '#center_col h3 > a';
	let selectors = selectorMainLinks + ',' + selectorSubLinks;

	// This is our token to mark the end of the links.
	// This is the "More results" button at the bottom of the page.
	let endSelector = 'a[aria-label="More results"]';

	// Grab all the links on the page.
	let nodes = document.querySelectorAll(selectors);
	let endNode = document.querySelector(endSelector);

	// Cut all the nodes away from the array after the end node.
	let array = Array.from(nodes);
	let endNodeIndex = array.indexOf(endNode);
	array.splice(endNodeIndex + 1);

	return array;
}
