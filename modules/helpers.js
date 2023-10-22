/* eslint-disable import/extensions */
import book from "./dom-manipulation.js";

// disableListButton

/**
 * The function disables the {@link book.list.botton} when invoked by the
 * {@link updateRemainingBooks} function. This will only occur when there are
 * zero books remaining to load in the app.
 */
const disableListButton = () => {
	book.list.button.disabled = true;
};

export default disableListButton;
