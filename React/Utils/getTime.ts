/**
 * Returns the current time in a 00:00 format
 */
const getTime = () => {
	const today = new Date();
	const hours =
		today.getHours() > 12
			? today.getHours() - 12
			: today.getHours() === 0
			? 12
			: today.getHours();
	const minutes = today.getMinutes().toString().padStart(2, "0");

	return `${hours}:${minutes}`;
};

export default getTime;
