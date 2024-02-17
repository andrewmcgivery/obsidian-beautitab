import { TIME_FORMAT } from "main";

/**
 * Returns the current time in a 00:00 format, either 12-hour or 24-hour
 */
const getTime = (timeFormat: TIME_FORMAT) => {
	const today = new Date();
	let hours;
	if (timeFormat === TIME_FORMAT.TWELVE_HOUR) {
		hours =
			today.getHours() > 12
				? today.getHours() - 12
				: today.getHours() === 0
				? 12
				: today.getHours();
	} else {
		hours = today.getHours();
	}

	const minutes = today.getMinutes().toString().padStart(2, "0");

	return `${hours}:${minutes}`;
};

export default getTime;
