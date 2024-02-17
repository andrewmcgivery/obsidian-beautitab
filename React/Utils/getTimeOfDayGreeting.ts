/**
 * Depending on the time of the day, returns a greeting like "Good morning"
 * @returns
 */
const getTimeOfDayGreeting = () => {
	const hours = new Date().getHours();

	if (hours >= 18 || hours < 5) {
		return "Good evening";
	} else if (hours >= 12) {
		return "Good afternoon";
	} else {
		return "Good morning";
	}
};

export default getTimeOfDayGreeting;
