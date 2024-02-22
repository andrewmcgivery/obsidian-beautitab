import { Modal, Setting, App } from "obsidian";

class ConfirmModal extends Modal {
	_onConfirm: Function;
	_title: string;
	_text: string;
	_confirmButtonText: string;
	_cancelButtonText: string;

	constructor(
		app: App,
		onConfirm: Function,
		title: string,
		text: string,
		confirmButtonText: string,
		cancelButtonText: string = "Cancel"
	) {
		super(app);

		this._onConfirm = onConfirm;
		this._title = title;
		this._text = text;
		this._confirmButtonText = confirmButtonText;
		this._cancelButtonText = cancelButtonText;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl("h2", { text: this._title });
		contentEl.createEl("p", { text: this._text });

		new Setting(contentEl)
			.addButton((component) => {
				component.setButtonText(this._confirmButtonText);
				component.setClass("mod-warning");

				component.onClick(() => {
					this._onConfirm();
					this.close();
				});
			})
			.addButton((component) => {
				component.setButtonText(this._cancelButtonText);
				component.onClick(() => {
					this.close();
				});
			});
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}

export default ConfirmModal;
