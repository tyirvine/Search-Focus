/* ------------------------------- Entry Point ------------------------------ */

// Sends a message to background.js to let it know that the content script has loaded.
browser.runtime.sendMessage({ message: 'loaded' });

// Receives a message from background.js to signal that the extension has been updated.
browser.runtime.onMessage.addListener(() => {
	update();
});

/* ---------------------------------- State --------------------------------- */

class State {
	#isPaused = true;
	#currentLinkIndex = 0;
	#previousLinkIndex = -1;
	#currentLink;
	#allLinks;

	getIsPaused() {
		return this.#isPaused;
	}

	setIsPaused(bool) {
		this.#isPaused = bool;
	}

	getCurrentLinkIndex() {
		return this.#currentLinkIndex;
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

function update() {
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
				case 'j':
					navigate('down', event, state);
					break;

				// Up navigation.
				case 'k':
					navigate('up', event, state);
					break;

				// Select the link.
				case 'Enter':
					state.clickCurrentLink();
					break;

				// Remove all highlights.
				case 'f':
					pauseExtension(state);
					break;

				// Bring the highlights back.
				case 'Escape':
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

function handleDocumentFocusChange(state) {
	// Captures the previous interval's document focus.
	let previousDocumentFocus;

	setInterval(() => {
		// Capture new focus changes if they're new.
		if (previousDocumentFocus === document.hasFocus()) {
			return;
		} else {
			previousDocumentFocus = document.hasFocus();
		}

		// React to focus changes.
		if (document.hasFocus()) {
			resumeExtension(state);
		} else {
			pauseExtension(state);
		}
	}, 50);
}

/* ------------------------------ Sub-routines ------------------------------ */

function select(state) {
	if (!state.getIsPaused()) {
		state.clickCurrentLink();
	}
}

function navigate(direction, event, state) {
	// If the extension is paused, don't do anything.
	if (state.getIsPaused()) {
		return;
	}

	// Prevent the default behavior of the key press.
	event.preventDefault();

	// Route the direction.
	if (direction === 'up') {
		state.selectPreviousLinkIndex();
	} else if (direction === 'down') {
		state.selectNextLinkIndex();
	} else {
		console.error('Invalid direction!');
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
