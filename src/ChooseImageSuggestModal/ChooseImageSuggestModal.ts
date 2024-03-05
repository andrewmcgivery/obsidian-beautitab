import { App, FuzzySuggestModal, TFile } from "obsidian";
import { BeautitabPluginSettings } from "src/Settings/Settings";

export interface Image {
	name: string;
	path: string;
}

class ChooseImageSuggestModal extends FuzzySuggestModal<TFile> {
	settings: BeautitabPluginSettings;
	onSubmit: (result: TFile) => void;
	result: TFile;

	constructor(app: App, onSubmit: (result: TFile) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	/**
	 * Gets all png/jpg images from the vault
	 */
	getItems(): TFile[] {
		return this.app.vault
			.getFiles()
			.filter((f) => ["jpg", "jpeg", "png"].includes(f.extension));
	}

	getItemText(item: TFile): string {
		return item.name;
	}

	onChooseItem(item: TFile, evt: MouseEvent | KeyboardEvent): void {
		this.result = item;
		this.onSubmit(item);
		this.close();
	}
}

export default ChooseImageSuggestModal;
