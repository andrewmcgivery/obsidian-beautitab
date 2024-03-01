import { App, FuzzySuggestModal } from "obsidian";
import { BeautitabPluginSettings } from "src/Settings/Settings";

export interface Image {
	name: string;
	path: string;
}

class ChooseImageSuggestModal extends FuzzySuggestModal<Image> {
	settings: BeautitabPluginSettings;
	onSubmit: (result: Image) => void;
	result: Image;

	constructor(app: App, onSubmit: (result: Image) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	/**
	 * Gets all png/jpg images from the vault
	 */
	getItems(): Image[] {
		return this.app.vault
			.getFiles()
			.filter((f) => ["jpg", "jpeg", "png"].includes(f.extension))
			.map((f) => ({ name: f.name, path: f.path }));
	}

	getItemText(item: Image): string {
		return item.name;
	}

	onChooseItem(item: Image, evt: MouseEvent | KeyboardEvent): void {
		this.result = item;
		this.onSubmit(item);
		this.close();
	}
}

export default ChooseImageSuggestModal;
