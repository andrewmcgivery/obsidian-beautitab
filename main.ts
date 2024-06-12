import { Notice, Platform, Plugin, InternalPluginName } from "obsidian";
import { ReactView, BEAUTITAB_REACT_VIEW } from "./Views/ReactView";
import Observable from "src/Utils/Observable";
import {
	BeautitabPluginSettingTab,
	BeautitabPluginSettings,
	DEFAULT_SETTINGS,
} from "src/Settings/Settings";

/**
 * This allows a "live-reload" of Obsidian when developing the plugin.
 * Any changes to the code will force reload Obsidian.
 */
if (process.env.NODE_ENV === "development") {
	new EventSource("http://127.0.0.1:8000/esbuild").addEventListener(
		"change",
		() => location.reload()
	);
}

export default class BeautitabPlugin extends Plugin {
	settings: BeautitabPluginSettings;
	settingsObservable: Observable;

	async onload() {
		await this.loadSettings();

		this.versionCheck();

		this.settingsObservable = new Observable(this.settings);

		this.registerView(
			BEAUTITAB_REACT_VIEW,
			(leaf) =>
				new ReactView(this.app, this.settingsObservable, leaf, this)
		);

		this.addSettingTab(new BeautitabPluginSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on(
				"layout-change",
				this.onLayoutChange.bind(this)
			)
		);

		if (process.env.NODE_ENV === "development") {
			if (process.env.EMULATE_MOBILE && !Platform.isMobile) {
				this.app.emulateMobile(true);
			}

			if (!process.env.EMULATE_MOBILE && Platform.isMobile) {
				this.app.emulateMobile(false);
			}
		}
	}

	onunload() {
		console.log("unloading Beautitab");
	}

	/**
	 * Load data from disk, stored in data.json in plugin folder
	 */
	async loadSettings() {
		const data = (await this.loadData()) || {};
		this.settings = Object.assign({}, DEFAULT_SETTINGS, data);
	}

	/**
	 * Save data to disk, stored in data.json in plugin folder
	 */
	async saveSettings() {
		await this.saveData(this.settings);
	}

	/**
	 * Check the local plugin version against github. If there is a new version, notify the user.
	 */
	async versionCheck() {
		const localVersion = process.env.PLUGIN_VERSION;
		const stableVersion = await requestUrl(
			"https://raw.githubusercontent.com/andrewmcgivery/obsidian-beautitab/main/package.json"
		).then(async (res) => {
			if (res.status === 200) {
				const response = await res.json;
				return response.version;
			}
		});
		const betaVersion = await requestUrl(
			"https://raw.githubusercontent.com/andrewmcgivery/obsidian-beautitab/beta/package.json"
		).then(async (res) => {
			if (res.status === 200) {
				const response = await res.json;
				return response.version;
			}
		});

		if (localVersion?.indexOf("beta") !== -1) {
			if (localVersion !== betaVersion) {
				new Notice(
					"There is a beta update available for the Beautitab plugin. Please update to to the latest version to get the latest features!",
					0
				);
			}
		} else if (localVersion !== stableVersion) {
			new Notice(
				"There is an update available for the Beautitab plugin. Please update to to the latest version to get the latest features!",
				0
			);
		}
	}

	/**
	 * Hijack new tabs and show Beauitab
	 */
	private onLayoutChange(): void {
		const leaf = this.app.workspace.getMostRecentLeaf();
		if (leaf?.getViewState().type === "empty") {
			leaf.setViewState({
				type: BEAUTITAB_REACT_VIEW,
			});
		}
	}

	/**
	 * Check if the choosen provider is enabled
	 * If yes: open it by using executeCommandById
	 * If no: Notice the user and tell them to enable it in the settings
	 */
	openSwitcherCommand(command: string): void {
		const pluginID = command.split(":")[0];
		const communitySwitcher = this.app.plugins.enabledPlugins.has(pluginID);
		const internalSwitcher = this.app.internalPlugins.getEnabledPluginById(pluginID as InternalPluginName);
		if (communitySwitcher || internalSwitcher) {
			this.app.commands.executeCommandById(command);
		} else {
			new Notice(
				`Plugin ${pluginID} is not enabled. Please enable it in the settings.`
			);
		}
	}
}
