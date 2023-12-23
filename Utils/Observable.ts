/**
 * An implementation of an Observable to subscribe to updates to a value
 */
class Observable {
	private value;
	private subscribers: Function[] = [];

	constructor(value: any) {
		this.value = value;
	}

	/**
	 * Set the value
	 * @param value
	 */
	setValue(value: any) {
		this.value = value;
		this.subscribers.forEach((callback) => callback({ ...this.value }));
	}

	/**
	 * Get the current value
	 */
	getValue() {
		return this.value;
	}

	/**
	 * Subscribe to changes in the value. Function returns a "unsubscribe" function to clean up as nessessary.
	 * @param callback
	 */
	onChange(callback: Function) {
		this.subscribers.push(callback);

		return () => {
			this.subscribers = this.subscribers.filter(
				(value) => value === callback
			);
		};
	}
}

export default Observable;
