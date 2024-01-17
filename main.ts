import { App, Plugin, PluginSettingTab, Setting } from "obsidian";
import { ReactView, BEAUTITAB_REACT_VIEW } from "./Views/ReactView";
import Observable from "Utils/Observable";
import capitalizeFirstLetter from "Utils/capitalizeFirstLetter";

export enum SearchProvider {
	SWITCHER = "switcher:open",
	OMNISEARCH = "omnisearch:show-modal",
	QUICKSWITCHER_PLUS = "darlal-switcher-plus:switcher-plus:open", // Open in standard mode
	ANOTHER_QUICKSWITCHER = "obsidian-another-quick-switcher:search-command_file-name-search"
}

export enum BackgroundTheme {
	SEASONS_AND_HOLIDAYS = "seasons and holidays",
	WINTER = "winter",
	SPRING = "spring",
	SUMMER = "summer",
	FALL = "fall",
	MOUNTAIN = "mountains",
	LAKES = "lakes",
	FOREST = "forest",
	ANIMALS = "animals",
	CUSTOM = "custom",
}

const SearchProviders = [
	{
		display: "Quick Switcher",
		value: SearchProvider.SWITCHER,
	},
	{
		display: "Omnisearch",
		value: SearchProvider.OMNISEARCH,
	},
	{
		display: "Quick Switcher++ (standard mode)",
		value: SearchProvider.QUICKSWITCHER_PLUS,
	},
	{
		display: "Another Quick Switcher (file name search)",
		value: SearchProvider.ANOTHER_QUICKSWITCHER,
	},
];

export interface BeautitabPluginSettings {
	backgroundTheme: BackgroundTheme;
	customBackground: string;
	showTopLeftSearchButton: boolean;
	topLeftSearchProvider: SearchProvider;
	showTime: boolean;
	showGreeting: boolean;
	greetingText: string;
	showInlineSearch: boolean;
	inlineSearchProvider: SearchProvider;
	showRecentFiles: boolean;
	showQuote: boolean;
}

const DEFAULT_SETTINGS: BeautitabPluginSettings = {
	backgroundTheme: BackgroundTheme.SEASONS_AND_HOLIDAYS,
	customBackground: "",
	showTopLeftSearchButton: true,
	topLeftSearchProvider: SearchProvider.SWITCHER,
	showTime: true,
	showGreeting: true,
	greetingText: "Hello, Beautiful.",
	showInlineSearch: true,
	inlineSearchProvider: SearchProvider.SWITCHER,
	showRecentFiles: true,
	showQuote: true,
};

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

		this.settingsObservable = new Observable(this.settings);

		this.registerView(
			BEAUTITAB_REACT_VIEW,
			(leaf) => new ReactView(this.app, this.settingsObservable, leaf)
		);

		this.addSettingTab(new BeautitabPluginSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on(
				"layout-change",
				this.onLayoutChange.bind(this)
			)
		);
	}

	onunload() {}

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

	openSwitcherCommand(command: string) {
		const pluginID = command.split(":")[0];
		//@ts-ignore
		const enabledPlugins = this.app.plugins.enabledPlugins as Set<string>;
		if (enabledPlugins.has(pluginID)) {
			//@ts-ignore
			this.app.commands.executeCommandById(command);
		} else {
			//@ts-ignore
			this.app.commands.executeCommandById(
				SearchProvider.SWITCHER
			);
		}
	}
}

class BeautitabPluginSettingTab extends PluginSettingTab {
	plugin: BeautitabPlugin;

	constructor(app: App, plugin: BeautitabPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	/**
	 * Filter SearchProvider based on what plugins are installed
	 */
	getSearchProvider() {
		const app = this.plugin.app;
		//@ts-ignore
		const plugins = app.plugins.enabledPlugins as Set<string>;

		const searchProviders = SearchProviders.filter((provider) => {
			return plugins.has(provider.value.split(":")[0]);
		});
		//include default provider, Obsidian core
		searchProviders.push(
			{
				display: "Quick Switcher",
				value: SearchProvider.SWITCHER,
			},
		);

		return searchProviders;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		const searchProviders = this.getSearchProvider();

		new Setting(containerEl)
			.setName("Background theme")
			.setDesc(
				`What theme would you like to utilize for the random backgrounds? "Seasons and Holidays" will use a different tag depending on the time of the year. Custom will allow you to input your own url.`
			)
			.addDropdown((component) => {
				Object.values(BackgroundTheme).forEach((theme) => {
					component.addOption(theme, capitalizeFirstLetter(theme));
				});

				component.setValue(this.plugin.settings.backgroundTheme);

				component.onChange((value: BackgroundTheme) => {
					this.plugin.settings.backgroundTheme = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
					this.display();
				});
			});

		if (this.plugin.settings.backgroundTheme === BackgroundTheme.CUSTOM) {
			new Setting(containerEl)
				.setName("Custom background url")
				.setDesc(`What url should be used for the background image?`)
				.addText((component) => {
					component.setValue(this.plugin.settings.customBackground);
					component.onChange((value) => {
						this.plugin.settings.customBackground = value;
						this.plugin.settingsObservable.setValue(
							this.plugin.settings
						);
						this.plugin.saveSettings();
					});
				});
		}

		new Setting(containerEl)
			.setName("Show top left search button")
			.setDesc(
				`Should the search button at the top left of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(
					this.plugin.settings.showTopLeftSearchButton
				);
				component.onChange((value) => {
					this.plugin.settings.showTopLeftSearchButton = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Top left search provider")
			.setDesc(
				`Which plugin should be utilized for search when clicking the top left button?`
			)
			.addDropdown((component) => {
				searchProviders.forEach((provider) => {
					component.addOption(provider.value, provider.display);
				});

				component.setValue(this.plugin.settings.topLeftSearchProvider);

				component.onChange((value: SearchProvider) => {
					this.plugin.settings.topLeftSearchProvider = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Show time")
			.setDesc(
				`Should the time in the middle of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.showTime);
				component.onChange((value) => {
					this.plugin.settings.showTime = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Show greeting")
			.setDesc(
				`Should the greeting in the middle of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.showGreeting);
				component.onChange((value) => {
					this.plugin.settings.showGreeting = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Greeting text")
			.setDesc(`What text should be displayed as a greeting?`)
			.addText((component) => {
				component.setValue(this.plugin.settings.greetingText);
				component.onChange((value) => {
					this.plugin.settings.greetingText = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Show inline search")
			.setDesc(
				`Should the inline search in the middle of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.showInlineSearch);
				component.onChange((value) => {
					this.plugin.settings.showInlineSearch = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Inline search provider")
			.setDesc(
				`Which plugin should be utilized for search when clicking the middle of the screen button?`
			)
			.addDropdown((component) => {
				searchProviders.forEach((provider) => {
					component.addOption(provider.value, provider.display);
				});

				component.setValue(this.plugin.settings.inlineSearchProvider);

				component.onChange((value: SearchProvider) => {
					this.plugin.settings.inlineSearchProvider = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Show recent files")
			.setDesc(
				`Should the recent files in the middle of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.showRecentFiles);
				component.onChange((value) => {
					this.plugin.settings.showRecentFiles = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName("Show quote")
			.setDesc(
				`Should the quote at the bottom of the new tab screen be displayed?`
			)
			.addToggle((component) => {
				component.setValue(this.plugin.settings.showQuote);
				component.onChange((value) => {
					this.plugin.settings.showQuote = value;
					this.plugin.settingsObservable.setValue(
						this.plugin.settings
					);
					this.plugin.saveSettings();
				});
			});
	}
}
