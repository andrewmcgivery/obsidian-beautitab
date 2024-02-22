/**
 * Capitlizes the firt letter of a string
 * @param string
 */
const capitalizeFirstLetter = (string: string) =>
	string.charAt(0).toUpperCase() + string.slice(1);

export default capitalizeFirstLetter;
