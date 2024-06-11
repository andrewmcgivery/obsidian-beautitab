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
 * Returns true if dateA within X hours of dateB (dateB minus X)
 * @param dateA
 * @param hours
 * @param dateB
 * @returns
 */
export const isWithinHoursBefore = (dateA: Date, hours: number, dateB: Date) => {
	const timestampA: number = dateA.getTime();
	const timestampB: number = dateB.getTime();
	const hoursInMilliseconds: number = hours * 60 * 60 * 1000;

	return (
		timestampA < timestampB && timestampB - timestampA <= hoursInMilliseconds
	);
};