import { BOOKS_PER_PAGE, authors, genres, books } from "./data.js";
export {
	createBookPreviewsHTML,
	updateRemainingBooks,
	loadFirstPage,
	current,
	book,
};

// createBookPreviewsHTML

/**
 * This function accepts a library of books as an `object`, extracts a specific
 * range of books, generates book previews in the form of button elements,
 * appends these previews to a `documentFragment` object, and finally returns
 * the `documentFragment`.
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

// updateRemainingBooks

/**
 * Performs a conditional check to determine the number of books available in the
 * {@link current.booksSource} reference book library. This value is compared against the
 * number of books loaded in the app, calculated based on the {@link current.page} number
 * multiplied by the fixed {@link BOOKS_PER_PAGE} value. The result is then
 * appended to the {@link book.list.button} inner HTML and displayed to the user.
 * If there aren't any remaining books in the reference book library, the function
 * will invoke the {@link disableListButton} function.
 */
const updateRemainingBooks = () => {
	const checkBooksInLibrary =
		current.booksSource.length - current.page * BOOKS_PER_PAGE;
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

/**
 * Loads books onto the first page and displays the count of remaining books that
 * the user can load. If the books loaded on the first page are less than the
 * {@link BOOKS_PER_PAGE}, it disables the {@link book.list.button}.
 *
 * For example, if the user's book search results return a number of books less
 * than the {@link NUMBER_OF_BOOKS_PER_PAGE}, the {@link book.list.button} will be
 * disabled as there will be `0` books remaining.
 *
 */
const loadFirstPage = () => {
	book.list.items.appendChild(createBookPreviewsHTML(current.booksSource));
	updateRemainingBooks();
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

/**
 * The object represents the current page of the book app (by default the page
 * is set to `1` to represent the 1st page), and `booksSource` which serves as a
 * reference object to an assigned book library database object (by default the
 * `booksSource` is set to the {@link books} database).
 *
 */
const current = {
	page: 1,
	booksSource: books,
};

loadFirstPage();

/* The below lines of code create genres and authors fragments which are then 
appended to the HTML DOM when the app loads. 
*/
book.search.genres.appendChild(createBookAttributeHTML(genres, "Genres"));
book.search.authors.appendChild(createBookAttributeHTML(authors, "Authors"));
/*
 */
