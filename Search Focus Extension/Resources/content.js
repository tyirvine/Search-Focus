/* ------------------------------- Entry Point ------------------------------ */

browser.runtime
	.sendMessage({
		page: 'check',
	})
	.then((response) => {
		handleResponse(response);
	});

/* ---------------------------------- State --------------------------------- */

class State {
	#currentLinkIndex = 0;
	#previousLinkIndex = -1;
	#currentLink;
	#allLinks;

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

function handleResponse(response) {
	// Here we receive the response to the message we sent.
	console.log('Response received:', response);

	// Here we store the current selected link index.
	let state = new State();

	// Grab all the links on the page and apply styles to them.
	updateLinks(state);

	// Update the links if the page resizes.
	handleResize(state);

	// Update the links when there's a key press.
	handleKeyPress(state);
}

function handleResize(state) {
	const resizeObserver = new ResizeObserver((entries) => {
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
				case 'ArrowDown':
					event.preventDefault();
					state.selectNextLinkIndex();
					break;

				// Up navigation.
				case 'ArrowUp':
					event.preventDefault();
					state.selectPreviousLinkIndex();
					break;

				// Select the link.
				case 'Enter':
					state.clickCurrentLink();
					break;

				default:
					break;
			}

			// Update the links.
			updateLinks(state);
		},
		true
	);
}

/* ------------------------------ Sub-routines ------------------------------ */

function updateLinks(state) {
	let links = grabLinks();

	// Add the link styling to the selected link and remove the link styling from any other links.
	links.forEach((link, index) => {
		// If this isn't the current link continue.
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
		if (state.isNewLinkSelected(index)) {
			console.log('Scrolling into view:', link);
			link.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
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
