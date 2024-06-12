import { App, FileView, WorkspaceLeaf } from "obsidian";
import { Root, createRoot } from "react-dom/client";
import ReactApp from "../React/Components/App/App";
import { ObsidianContext } from "../React/Context/ObsidianAppContext";
import Observable from "src/Utils/Observable";
import BeautitabPlugin from "main";

export const BEAUTITAB_REACT_VIEW = "beautitab-react-view";
const Translate = i18next.t.bind(i18next);

export class ReactView extends FileView {
	root: Root | null = null;
	app: App;
	settingsObservable: Observable;
	plugin: BeautitabPlugin;

	constructor(
		app: App,
		settingsObservable: Observable,
		leaf: WorkspaceLeaf,
		plugin: BeautitabPlugin
	) {
		super(leaf);
		this.app = app;
		this.settingsObservable = settingsObservable;
		this.allowNoFile = true;
		this.plugin = plugin;
	}

	getViewType() {
		return BEAUTITAB_REACT_VIEW;
	}

	getDisplayText() {
		return Translate("interface.label-new-tab");
	}

	getIcon() {
		return "";
	}

	async onOpen() {
		this.root = createRoot(this.contentEl);
		this.root.render(
			<ObsidianContext.Provider value={this.app}>
				<ReactApp
					settingsObservable={this.settingsObservable}
					plugin={this.plugin}
				/>
			</ObsidianContext.Provider>
		);
		this.containerEl.addClass("beautitab");
	}

	async onClose() {
		this.root?.unmount();
	}
}
