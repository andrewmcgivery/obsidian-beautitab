/**
 * Returns true if dateA within 5 days of dateB (dateB minus 5)
 * @param dateA
 * @param days
 * @param dateB
 */
export const isWithinDaysBefore = (
	dateA: Date,
	days: number,
	dateB: Date
): boolean => {
	const timestampA: number = dateA.getTime();
	const timestampB: number = dateB.getTime();
	const daysInMilliseconds: number = days * 24 * 60 * 60 * 1000;

	return (
		timestampA < timestampB && timestampB - timestampA <= daysInMilliseconds
	);
};

/**
 * Returns true if dateA within 5 days of dateB (dateB plus 5)
 * @param dateA
 * @param days
 * @param dateB
 * @returns
 */
export const isWithinDaysAfter = (
	dateA: Date,
	days: number,
	dateB: Date
): boolean => {
	const timestampA: number = dateA.getTime();
	const timestampB: number = dateB.getTime();
	const daysInMilliseconds: number = days * 24 * 60 * 60 * 1000;

	return (
		timestampB < timestampA && timestampA - timestampB <= daysInMilliseconds
	);
};

/**
 * Returns true if the hours of dateA are within the hours of dateB
 * Aka dateA is *before* dateB and their hours of difference is more than 1 hours
 * @param dateA {Date} - The "cached" date
 * @param hours {number} - The number of hours to compare
 * @param dateB {Date} - The "current" date
 * @returns {boolean}
 */
export const isWithinHoursAfter = (dateA: Date, hours: number, dateB: Date) => {
	const timestampA: number = dateA.getHours();
	const timestampB: number = dateB.getHours();
	return timestampA < timestampB && timestampA - timestampB >= hours;
};