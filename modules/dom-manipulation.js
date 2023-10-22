/* eslint-disable import/extensions */
import { authors, genres } from "./data.js";

/**
 * Finds and returns the HTML element with the provided data attribute. Throws
 * an error if the element with the specified data attribute is not found.
 *
 * @param {string} dataAttribute - The data attribute to search for, including
 * the `data-` prefix.
 * @returns {HTMLElement} The HTML element with the specified data attribute.
 */
const getHTML = (dataAttribute) => {
	const element = document.querySelector(`[${dataAttribute}]`);
	const isHTMLElement = element instanceof HTMLElement;

	if (!isHTMLElement) {
		throw new Error(
			`The element with the data attribute ${element} does not exist.`
		);
	}
	return element;
};

// HTML DOM Elements

/**
 * An Object literal which includes all the HTML elements that are referenced in
 * the Javascript script and modules codebase. The elements are structured
 * within sub-Object literals in order to create separation based on the type of
 * function/ purpose they serve in the app. *
 */
const book = {
	header: {
		search: getHTML("data-header-search"),
		settings: getHTML("data-header-settings"),
	},
	list: {
		dialog: getHTML("data-list-active"),
		items: getHTML("data-list-items"),
		message: getHTML("data-list-message"),
		title: getHTML("data-list-title"),
		blur: getHTML("data-list-blur"),
		image: getHTML("data-list-image"),
		subtitle: getHTML("data-list-subtitle"),
		description: getHTML("data-list-description"),
		button: getHTML("data-list-button"),
		close: getHTML("data-list-close"),
	},
	search: {
		dialog: getHTML("data-search-overlay"),
		form: getHTML("data-search-form"),
		title: getHTML("data-search-title"),
		genres: getHTML("data-search-genres"),
		authors: getHTML("data-search-authors"),
		cancel: getHTML("data-search-cancel"),
	},
	settings: {
		dialog: getHTML("data-settings-overlay"),
		form: getHTML("data-settings-form"),
		theme: getHTML("data-settings-theme"),
		cancel: getHTML("data-settings-cancel"),
	},
};

// createBookAttributeHTML

/**
 * Generates a document fragment containing option elements for a collection of
 * genres or authors.
 *
 * @param {Object<string, string>} bookAttributeSource - An object with a
 * collection of either genres or authors.
 * @param {"Genres" | "Authors"} attributeType - The type of book attribute
 * source (`"Genres"` or `"Authors"`).
 * @returns {DocumentFragment} A document fragment containing option elements to
 * be added to the HTML DOM and displayed to the user.
 */
const createBookAttributeHTML = (bookAttributeSource, attributeType) => {
	const bookAttributeFragment = document.createDocumentFragment();
	const firstOptionElement = document.createElement("option");

	firstOptionElement.value = "any";
	firstOptionElement.innerText = `All ${attributeType}`;

	bookAttributeFragment.appendChild(firstOptionElement);

	// eslint-disable-next-line no-restricted-syntax
	for (const [id, name] of Object.entries(bookAttributeSource)) {
		const optionElement = document.createElement("option");

		optionElement.value = id;
		optionElement.innerText = name;
		bookAttributeFragment.appendChild(optionElement);
	}
	return bookAttributeFragment;
};

/* The below lines of code create genres and authors fragments which are then
appended to the HTML DOM when the app loads. 
*/
book.search.genres.appendChild(createBookAttributeHTML(genres, "Genres"));
book.search.authors.appendChild(createBookAttributeHTML(authors, "Authors"));

export default book;
