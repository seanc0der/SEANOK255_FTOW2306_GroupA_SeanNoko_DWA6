/* eslint-disable import/extensions */
import disableListButton from "./helpers.js";
import book from "./dom-manipulation.js";
import { books, authors } from "./data.js";

export const BOOKS_PER_PAGE = 36;

/**
 * @typedef {object} BookItem - A book object containing specific metadata expressed as object properties.
 * @property {string} id - The book ID.
 * @property {string[]} genres - An array of genre IDs, which can be used to find the genre name from the {@link genres} database.
 * @property {number} popularity - The rank of the book based on popularity. The higher the number, the less popular it is.
 * @property {string} title - The title of the book.
 * @property {string} image - The thumbnail or cover photo of the book.
 * @property {string} description - A synopsis of the book.
 * @property {number} pages - The total number of pages of the book.
 * @property {string} published - The date the book was published, in the ISO Date format.
 * @property {string} author - The author ID, which can be used to find the author's name from the {@link author} database.
 */

/**
 * @typedef {BookItem[]} BookLibrary - An array representing a collection of book items, see {@link BookItem}.
 */

// createBookPreviewsHTML

/**
 * This function accepts a library of books as an `object`, extracts a specific
 * range of books, generates book previews in the form of button elements,
 * appends these previews to a `documentFragment` object, and finally returns
 * the `documentFragment`.
 *
 * @param {BookLibrary} booksSource - The library of books.
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

	// eslint-disable-next-line no-restricted-syntax
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

// createBooksPreview

/**
 * @callback EmptyFn
 * @returns {void}
 */

/**
 * Represents an object that handles book previews and related operations.
 * @typedef {object} BooksPreview
 *
 * @property {BookLibrary} currentBooksSource - The current library or source of
 * books.
 *
 * @property {EmptyFn} loadFirstPage - Clears the book list section and loads
 * the initial book preview fragment to the {@link book.list.items} HTML
 * Element. Updates the count of remaining books after loading.
 *
 * @property {EmptyFn} loadNextPage - Loads additional books onto the next page,
 * updates the page number internally, and displays the count of remaining books
 * that the user can load. If no books are left to load, it disables the
 * {@link book.list.button}.
 */

/**
 * Factory function that creates and returns a books preview object from the
 * provided books source data. The returned methods offer a complete solution
 * for generating a book preview fragment from the provided books source,
 * appending it to the HTML DOM, and updating the number of remaining books,
 * depending on whether it's the first page or additional pages to be loaded.
 * This function enables the setting and retrieval of the current books source,
 * providing a flexible way to manage the books source reference data at all
 * times.
 *
 * @param {BookLibrary} booksSource - The library/source of books.
 * @returns {BooksPreview} The created BooksPreview object.
 */
const createBooksPreview = (booksSource) => {
	const current = {
		page: 1,
		booksSource,
		/**
		 * Performs a conditional check to determine the number of books available in
		 * the {@link current.booksSource} reference book library. This value is
		 * compared against the number of books loaded in the app, calculated based on
		 * the {@link current.page} number multiplied by the fixed
		 * {@link BOOKS_PER_PAGE} value. The result is then appended to the
		 * {@link book.list.button} inner HTML and displayed to the user. If there
		 * aren't any remaining books in the reference book library, the function will
		 * invoke the {@link disableListButton} function.
		 */
		updateRemainingBooks() {
			const checkBooksInLibrary =
				this.booksSource.length - this.page * BOOKS_PER_PAGE;
			const remainingBooks =
				(checkBooksInLibrary > 0 && checkBooksInLibrary) || 0;

			book.list.button.innerHTML = /* html */ `
				<span>Show more</span>, 
				<span class="list__remaining">(${remainingBooks})</span>
			`;

			if (remainingBooks === 0) disableListButton();
		},
	};

	const loadFirstPage = () => {
		if (current.page !== 1) current.page = 1;

		book.list.items.innerHTML = "";
		book.list.items.appendChild(createBookPreviewsHTML(current.booksSource));
		current.updateRemainingBooks();
	};

	const loadNextPage = () => {
		book.list.items.appendChild(
			createBookPreviewsHTML(current.booksSource, current.page)
		);
		current.page += 1;
		current.updateRemainingBooks();
	};

	return {
		get currentBooksSource() {
			return current.booksSource;
		},
		set currentBooksSource(newBooksSource) {
			current.booksSource = newBooksSource;
		},
		loadFirstPage,
		loadNextPage,
	};
};

/**
 * A books preview object based on the {@link books} as its book source argument
 * (default). The default book source can be replaced with a different one by
 * passing it as an argument to the `replaceBooksSource` object method.
 * Subsequently, the {@link loadFirstPage} and {@link loadNextPage} methods can
 * be invoked to regenerate and append the new book previews to the
 * {@link book.list.items} HTML Element.
 */
export const booksPreviewObj = createBooksPreview(books);

// Upon app loading, the first book preview is added to the beginning of the
// first page, and the remaining book count is updated.
booksPreviewObj.loadFirstPage();
