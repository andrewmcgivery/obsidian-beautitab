import { App, ItemView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import ReactApp from "../React/Components/App/App";
import { ObsidianContext } from "../React/Context/ObsidianAppContext";
import Observable from "Utils/Observable";

export const BEAUTITAB_REACT_VIEW = "beautitab-react-view";

export class ReactView extends ItemView {
	root: Root | null = null;
	app: App;
	settingsObservable: Observable;

	constructor(app: App, settingsObservable: Observable, leaf: WorkspaceLeaf) {
		super(leaf);
		this.app = app;
		this.settingsObservable = settingsObservable;
	}

	getViewType() {
		return BEAUTITAB_REACT_VIEW;
	}

	getDisplayText() {
		return "New tab";
	}

	getIcon() {
		return "";
	}

	async onOpen() {
		this.root = createRoot(this.containerEl.children[1]);
		this.root.render(
			<ObsidianContext.Provider value={this.app}>
				<ReactApp settingsObservable={this.settingsObservable} />
			</ObsidianContext.Provider>
		);
		this.containerEl.addClass("beautitab");
	}

	async onClose() {
		this.root?.unmount();
	}
}
