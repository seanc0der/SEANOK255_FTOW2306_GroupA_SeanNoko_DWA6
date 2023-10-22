/* eslint-disable import/extensions */
import { authors, books } from "./modules/data.js";

import book from "./modules/dom-manipulation.js";

import { booksPreviewObj } from "./modules/books-preview.js";

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

	handleToggleDialog("settings");
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

	// eslint-disable-next-line no-restricted-syntax
	for (const node of pathArray) {
		if (active) break;

		if (node?.dataset?.preview) {
			let result = null;

			// eslint-disable-next-line no-restricted-syntax
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

// handleBookFilterSearch

/**
 * This event handler takes a user's book search inputs (`title`, `authors`,
 * and/or `genres`) when the {@link book.search.form} is submitted. It iterates
 * over the {@link books} book library and assigns the result of all books that
 * match the supplied search inputs to the {@link current.booksSource} as the
 * new reference book library, but filtered. The {@link current.page} is reset
 * to `1`, the {@link book.list.items} book preview catalog is cleared, and the
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

	// eslint-disable-next-line no-restricted-syntax, no-shadow
	for (const book of books) {
		let genreMatch = filters.genre === "any";

		// eslint-disable-next-line no-restricted-syntax
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

	if (result.length < 1) {
		book.list.message.classList.add("list__message_show");
	} else {
		book.list.message.classList.remove("list__message_show");
	}

	booksPreviewObj.currentBooksSource = result;
	booksPreviewObj.loadFirstPage();

	window.scrollTo({ top: 0, behavior: "smooth" });
	handleToggleDialog("search");
};

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

book.list.button.addEventListener("click", booksPreviewObj.loadNextPage);
book.list.items.addEventListener("click", handleOpenBookPreviewDialog);
book.search.form.addEventListener("submit", handleBookFilterSearch);
book.settings.form.addEventListener("submit", toggleThemeHandler);
