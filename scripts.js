import { BOOKS_PER_PAGE, authors, genres, books } from "./data.js";

// createBookPreviewsHTML

/**
 * This function accepts a library of books as an `object`, extracts a specific
 * range of books, generates book previews in the form of button elements,
 * appends these previews to a `documentFragment` object, and finally returns
 * the `documentFragment`. Additionally, the function will increment the
 * {@link page} by `1` each time it's called with a `pageNum` argument greater
 * than the default value of `0` to keep the {@link page} number up-to-date.
 *
 * @param {object[]} booksSource - The library of books.
 * @param {number} [pageNum = 0] - The current page number of the book catalog.
 * By default, the `pageNum` is set to `0`. When creating the first book
 * previews fragment, the `pageNum` should be omitted, or `0` can be passed as
 * an argument, as this book previews fragment is to be added to the first page
 * of the book catalog section of the app. Thereafter, the function, which
 * should now include a `pageNum` argument greater than the default value,
 * should be invoked every time a user clicks the {@link book.list.button}
 * button to load more books, which creates additional book previews fragments.
 * @returns {DocumentFragment} A `documentFragment` containing a maximum of 36
 * newly created book previews ready to be added to the HTML DOM for user
 * display.
 */
const createBookPreviewsHTML = (booksSource, pageNum = 0) => {
	const bookPreviewsFragment = document.createDocumentFragment();
	const startingRange = pageNum * BOOKS_PER_PAGE;
	const endingRange = (pageNum + 1) * BOOKS_PER_PAGE;
	const extractedBooks = booksSource.slice(startingRange, endingRange);

	for (const { author, id, image, title } of extractedBooks) {
		const element = document.createElement("button");
		element.classList = "preview";
		element.setAttribute("data-preview", id);

		element.innerHTML = `
			<img
				class="preview__image"
				src="${image}"
			/>

			<div class="preview__info">
				<h3 class="preview__title">${title}</h3>
				<div class="preview__author">${authors[author]}</div>
			</div>
		`;

		bookPreviewsFragment.appendChild(element);
	}

	if (pageNum > 0) page += 1;
	updateRemainingBooks();
	return bookPreviewsFragment;
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

	for (const [id, name] of Object.entries(bookAttributeSource)) {
		const optionElement = document.createElement("option");

		optionElement.value = id;
		optionElement.innerText = name;
		bookAttributeFragment.appendChild(optionElement);
	}
	return bookAttributeFragment;
};

// toggleThemeHandler

/**
 * Event handler function triggered when a user submits the
 * {@link book.settings.form}. This function retrieves the selected
 * {@link book.settings.theme} value, which can be either `night` or `day`. The
 * selected theme is used as a key to fetch the corresponding CSS RGB color
 * styles for the dark and light themes from the {@link css} object literal.
 * These CSS property values are then individually parsed into the
 * `CSSStyleDeclaration.setProperty()` method as new values. Subsequently, the
 * CSS properties (`--color-dark` or `--color-light`) are updated using this
 * method, effectively toggling the app's theme between 'night' and 'day.'
 *
 * @param {Event} event - The event object representing the form submission.
 */
const toggleThemeHandler = (event) => {
	event.preventDefault();

	const css = {
		day: { dark: "10, 10, 20", light: "255, 255, 255" },
		night: { dark: "255, 255, 255", light: "10, 10, 20" },
	};
	const formData = new FormData(event.target);
	const { theme } = Object.fromEntries(formData);
	const styleDeclaration = document.styleSheets[0].cssRules[0].style;

	styleDeclaration.setProperty("--color-dark", css[theme].dark);
	styleDeclaration.setProperty("--color-light", css[theme].light);

	book.settings.dialog.open = false;
};

// toggleDialogHandler

/**
 * Toggles the dialog for either {@link book.search.dialog},
 * {@link book.list.dialog}, or {@link book.settings.dialog} based on the
 * provided {@link feature}. The function automatically opens the dialog modal
 * if it's closed, or closes it if it's open, for the associated `feature`
 * (search, list, or settings dialog) when invoked.
 *
 * @param {"search" | "list" | "settings"} feature - The app features that
 * support the dialog modal.
 */
const handleToggleDialog = (feature) => {
	if (book[feature].dialog.open) {
		book[feature].dialog.close();
	} else {
		book[feature].dialog.showModal();
	}
};

// handleOpenBookPreviewDialog

/**
 * Handles the click event when a book preview from {@link book.list.items} is
 * clicked. This function extracts the `preview id` of the clicked button
 * element (book preview), then searches the {@link books} object for the
 * matching book. If found, it populates the elements within
 * {@link book.list.dialog} (`title`, `subtitle`, `description`, `image`,
 * `blur`) with the book's data and displays the dialog modal to the user.
 *
 * @param {Event} event - The click event.
 */
const handleOpenBookPreviewDialog = (event) => {
	const pathArray = Array.from(event.path || event.composedPath());
	let active = null;

	for (const node of pathArray) {
		if (active) break;

		if (node?.dataset?.preview) {
			let result = null;

			for (const singleBook of books) {
				if (result) break;
				if (singleBook.id === node?.dataset?.preview) result = singleBook;
			}

			active = result;
		}
	}

	if (active) {
		handleToggleDialog("list");
		book.list.blur.src = active.image;
		book.list.image.src = active.image;
		book.list.title.innerText = active.title;
		book.list.subtitle.innerText = `${authors[active.author]} (${new Date(
			active.published
		).getFullYear()})`;
		book.list.description.innerText = active.description;
	}
};

// updateRemainingBooks

/**
 * Performs a conditional check to determine the number of books available in the
 * {@link matches} reference book library. This value is compared against the
 * number of books loaded in the app, calculated based on the {@link page} number
 * multiplied by the fixed {@link BOOKS_PER_PAGE} value. The result is then
 * appended to the {@link book.list.button} inner HTML and displayed to the user.
 * If there aren't any remaining books in the reference book library, the function
 * will invoke the {@link disableListButton} function.
 */
const updateRemainingBooks = () => {
	const checkBooksInLibrary = matches.length - page * BOOKS_PER_PAGE;
	const remainingBooks = (checkBooksInLibrary > 0 && checkBooksInLibrary) || 0;

	book.list.button.innerHTML = /* html */ `
		<span>Show more</span>, 
		<span class="list__remaining">(${remainingBooks})</span>
	`;

	if (remainingBooks === 0) disableListButton();
};

// disableListButton

/**
 * The function disables the {@link book.list.botton} when invoked by the
 * {@link updateRemainingBooks} function. This will only occur when there are
 * zero books remaining to load in the app.
 */
const disableListButton = () => {
	book.list.button.disabled = true;
};

// handleBookFilterSearch

/**
 * This event handler takes a user's book search inputs (`title`, `authors`,
 * and/or `genres`) when the {@link book.search.form} is submitted. It iterates
 * over the {@link books} book library and assigns the result of all books that
 * match the supplied search inputs to the {@link matches} as the new reference
 * book library, but filtered. The {@link page} is reset to `1`, the
 * {@link book.list.items} book preview catalog is cleared, and the
 * {@link createBookPreviewsHTML} function is called to create the first
 * filtered book previews fragment, which is then appended to the HTML DOM.
 * Additional filtered book previews fragments will be created and appended to
 * the HTML DOM when the user loads more books by clicking the
 * {@link book.list.button}. If the book search returns fewer than `1` book from
 * the main book library, an error message will be displayed to the user.
 */
const handleBookFilterSearch = (event) => {
	event.preventDefault();

	const formData = new FormData(event.target);
	const filters = Object.fromEntries(formData);
	const result = [];

	for (const book of books) {
		let genreMatch = filters.genre === "any";

		for (const singleGenre of book.genres) {
			if (genreMatch) break;
			if (singleGenre === filters.genre) genreMatch = true;
		}

		if (
			(filters.title.trim() === "" ||
				book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
			(filters.author === "any" || book.author === filters.author) &&
			genreMatch
		) {
			result.push(book);
		}
	}

	page = 1;
	matches = result;

	if (result.length < 1) {
		book.list.message.classList.add("list__message_show");
	} else {
		book.list.message.classList.remove("list__message_show");
	}

	const firstFilteredBookPreviewsFragment = createBookPreviewsHTML(matches);

	book.list.items.innerHTML = "";
	book.list.items.appendChild(firstFilteredBookPreviewsFragment);

	window.scrollTo({ top: 0, behavior: "smooth" });

	handleToggleDialog("search");
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
		search: document.querySelector("[data-header-search]"),
		settings: document.querySelector("[data-header-settings]"),
	},
	list: {
		dialog: document.querySelector("[data-list-active]"),
		items: document.querySelector("[data-list-items]"),
		message: document.querySelector("[data-list-message]"),
		title: document.querySelector("[data-list-title]"),
		blur: document.querySelector("[data-list-blur]"),
		image: document.querySelector("[data-list-image]"),
		subtitle: document.querySelector("[data-list-subtitle]"),
		description: document.querySelector("[data-list-description]"),
		button: document.querySelector("[data-list-button]"),
		close: document.querySelector("[data-list-close]"),
	},
	search: {
		dialog: document.querySelector("[data-search-overlay]"),
		form: document.querySelector("[data-search-form]"),
		title: document.querySelector("[data-search-title]"),
		genres: document.querySelector("[data-search-genres]"),
		authors: document.querySelector("[data-search-authors]"),
		cancel: document.querySelector("[data-search-cancel]"),
		search: document.querySelector('button[form="search"]'),
	},
	settings: {
		dialog: document.querySelector("[data-settings-overlay]"),
		form: document.querySelector("[data-settings-form]"),
		theme: document.querySelector("[data-settings-theme]"),
		cancel: document.querySelector("[data-settings-cancel]"),
		save: document.querySelector('button[form="settings"]'),
	},
};

let page = 1;
let matches = books;

const firstBookPreviewsFragment = createBookPreviewsHTML(matches);

book.list.items.appendChild(firstBookPreviewsFragment);
book.search.genres.appendChild(createBookAttributeHTML(genres, "Genres"));
book.search.authors.appendChild(createBookAttributeHTML(authors, "Authors"));

// Event Handlers

book.search.cancel.addEventListener("click", () => {
	handleToggleDialog("search");
});

book.settings.cancel.addEventListener("click", () => {
	handleToggleDialog("settings");
});

book.header.search.addEventListener("click", () => {
	handleToggleDialog("search");
	book.search.title.focus();
});

book.header.settings.addEventListener("click", () => {
	handleToggleDialog("settings");
});

book.list.close.addEventListener("click", () => {
	handleToggleDialog("list");
});

book.list.button.addEventListener("click", () => {
	book.list.items.appendChild(createBookPreviewsHTML(matches, page));
});

book.list.items.addEventListener("click", handleOpenBookPreviewDialog);
book.search.form.addEventListener("submit", handleBookFilterSearch);
book.settings.form.addEventListener("submit", toggleThemeHandler);
