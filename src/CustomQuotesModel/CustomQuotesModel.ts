import BeautitabPlugin from "main";
import { Modal, Setting } from "obsidian";
import ConfirmModal from "src/ConfirmModal/ConfirmModal";
import { CustomQuote } from "src/Types/Interfaces";

class CustomQuotesModel extends Modal {
	_onSave: Function;
	_plugin: BeautitabPlugin;
	_customQuotes: CustomQuote[];

	constructor(plugin: BeautitabPlugin, onSave: Function) {
		super(plugin.app);
		this._plugin = plugin;
		this._onSave = onSave;
		// Ugly way to deep clone the array and its objects
		this._customQuotes = JSON.parse(
			JSON.stringify(this._plugin.settings.customQuotes)
		);
	}

	onOpen() {
		this.display();
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}

	display(): void {
		const { contentEl } = this;

		contentEl.empty();

		contentEl.createEl("h2", { text: "Custom quotes" });

		const table = contentEl.createEl("table", { cls: "customQuotesTable" });
		const thead = table.createEl("thead");
		const headerRow = thead.createEl("tr");
		headerRow.createEl("th");
		headerRow.createEl("th", { text: "Text" });
		headerRow.createEl("th", { text: "Author" });
		const tbody = table.createEl("tbody");

		this._customQuotes.forEach((customQuote, index) => {
			const tableRow = tbody.createEl("tr");

			const actionCell = tableRow.createEl("td");
			const removeButton = actionCell.createEl("button", {
				text: "Remove",
				cls: "mod-warning",
			});
			removeButton.addEventListener("click", () => {
				new ConfirmModal(
					this.app,
					() => {
						this._customQuotes.splice(index, 1);
						this.display();
					},
					"Remove quote",
					`Are you sure?`,
					"Remove"
				).open();
			});

			const textCell = tableRow.createEl("td");
			const quoteTextInput = textCell.createEl("textarea", {
				text: customQuote.text,
			});
			quoteTextInput.addEventListener("change", (e: any) => {
				this._customQuotes[index].text = e.target?.value;
			});

			const authorCell = tableRow.createEl("td");
			const quoteAuthorInput = authorCell.createEl("input", {
				type: "text",
				value: customQuote.author,
			});
			quoteAuthorInput.addEventListener("change", (e: any) => {
				this._customQuotes[index].author = e.target?.value;
			});
		});

		new Setting(contentEl).addButton((component) => {
			component.setButtonText("Add new quote").onClick(() => {
				this._customQuotes.push({
					text: "",
					author: "",
				});
				this.display();
			});
		});

		new Setting(contentEl).addButton((component) => {
			component.setButtonText("Save");

			component.setCta().onClick(() => {
				this._onSave(this._customQuotes);
				this.close();
			});
		});
	}
}

export default CustomQuotesModel;
