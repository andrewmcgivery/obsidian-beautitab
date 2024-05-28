import React, { useEffect, useMemo, useRef, useState } from "react";
import { TFile, getIcon } from "obsidian";

import { BackgroundTheme } from "src/Types/Enums";
import BeautitabPlugin from "main";
import { BeautitabPluginSettings } from "src/Settings/Settings";
import Observable from "src/Utils/Observable";
import getBackground from "React/Utils/getBackground";
import { getBookmarks } from "React/Utils/getBookmarks";
import getQuote from "React/Utils/getQuote";
import getTime from "React/Utils/getTime";
import getTimeOfDayGreeting from "React/Utils/getTimeOfDayGreeting";
import { useObsidian } from "../../Context/ObsidianAppContext";

/**
 * Given an icon name, converts a Obsidian icon to a usable SVG string and embeds it into a span.
 * @returns
 */
const Icon = ({ name }: { name: string }) => {
	const iconText = new XMLSerializer().serializeToString(
		getIcon(name) || new Node()
	);

	return (
		<span
			className="beautitab-icon"
			dangerouslySetInnerHTML={{
				__html: iconText,
			}}
		></span>
	);
};

const App = ({
	settingsObservable,
	plugin,
}: {
	settingsObservable: Observable;
	plugin: BeautitabPlugin;
}) => {
	const [quote, setQuote] = useState<{
		content: string;
		author: string;
	} | null>(null);
	const [settings, setSettings] = useState<BeautitabPluginSettings>(
		settingsObservable.getValue()
	);
	const [time, setTime] = useState(getTime(settings.timeFormat));
	const mainDivRef = useRef<HTMLDivElement>(null);

	const obsidian = useObsidian();
	const background = useMemo(
		() =>
			getBackground(
				settings.backgroundTheme,
				settings.customBackground,
				settings.localBackgrounds,
				{ debugLogging: settings.debugLogging },
			),
		[
			settings.backgroundTheme,
			settings.customBackground,
			settings.localBackgrounds,
			settings.debugLogging,
		]
	);

	const allVaultFiles = obsidian?.vault.getAllLoadedFiles();
	const latestModifiedMarkdownFiles = useMemo(() => {
		const files = allVaultFiles?.filter(
			(file) => file instanceof TFile && file.extension === "md"
		);
		files?.sort((a, b) =>
			a instanceof TFile && b instanceof TFile
				? b.stat.mtime - a.stat.mtime
				: 0
		);
		return files?.slice(0, 5);
	}, [allVaultFiles]);

	const bookmarks = useMemo(
		() => getBookmarks(obsidian, settings).slice(0, 5),
		[obsidian, settings]
	);

	/**
	 * Keep the time up to date by updating it every second
	 * Note that this shouldn't cause extra renders because calling "setTime" with a duplicate value should skip the render
	 */
	useEffect(() => {
		const timer = setInterval(() => {
			setTime(getTime(settings.timeFormat));
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, [setTime, settings]);

	/**
	 * Get a random quote
	 */
	useEffect(() => {
		getQuote(settings.quoteSource, settings.customQuotes).then(
			(newQuote: any) => {
				setQuote(newQuote);
			}
		);
	}, [setQuote, settings.quoteSource, settings.customQuotes]);

	/**
	 * Subscribe to settings from Obsidian
	 */
	useEffect(() => {
		const unsubscribe = settingsObservable.onChange(
			(newSettings: BeautitabPluginSettings) => {
				setSettings(newSettings);
			}
		);

		return () => {
			unsubscribe();
		};
	}, [setSettings]);

	/**
	 * Auto focus so key presses launch search
	 */
	useEffect(() => {
		mainDivRef?.current?.focus();
	}, []);

	return (
		<div
			className={`beautitab-root ${
				settings.backgroundTheme === BackgroundTheme.TRANSPARENT &&
				"beautitab-root--transparent"
			}
			
			${
				settings.backgroundTheme ===
					BackgroundTheme.TRANSPARENT_WITH_SHADOWS &&
				"beautitab-root--transparentWithShadows"
			}
			`}
			// @ts-ignore
			style={{
				backgroundImage: `url("${background}")`,
			}}
			onKeyDown={(e) => {
				if (!e.ctrlKey && !e.altKey && /^[A-Za-z0-9]$/.test(e.key)) {
					plugin.openSwitcherCommand(
						settings.inlineSearchProvider.command
					);
				}
			}}
			tabIndex={0} // Make the div focusable so we can capture key strokes
			ref={mainDivRef}
		>
			<div className="beautitab-wrapper">
				<div className="beautitab-top">
					{settings.showTopLeftSearchButton && (
						<a
							className="beautitab-iconbutton"
							onClick={() => {
								plugin.openSwitcherCommand(
									settings.topLeftSearchProvider.command
								);
							}}
						>
							<span className="beautitab-iconbutton-text">
								Open Search
							</span>
							<Icon name="search" />
						</a>
					)}
				</div>
				<div className="beautitab-center">
					{settings.showTime && (
						<div className="beautitab-time">{time}</div>
					)}
					{settings.showGreeting && (
						<div className="beautitab-greeting">
							{settings.greetingText.replace(
								/{{greeting}}/gi,
								getTimeOfDayGreeting()
							)}
						</div>
					)}
				</div>
				<div className="beautitab-bottom">
					<div className="beautitab-search">
						{settings.showInlineSearch && (
							<a
								className="beautitab-search-wrapper"
								onClick={() => {
									plugin.openSwitcherCommand(
										settings.inlineSearchProvider.command
									);
								}}
							>
								<Icon name="search" />
								<span className="beautitab-search-text">
									Search
								</span>
							</a>
						)}
					</div>
					{settings.showRecentFiles && (
						<div className="beautitab-recentlyedited">
							{latestModifiedMarkdownFiles?.map(
								(file) =>
									file instanceof TFile && (
										<a
											key={file.path}
											className="beautitab-recentlyedited-file"
											data-path={file.path}
											onClick={() => {
												const leaf =
													obsidian?.workspace.getMostRecentLeaf();
												if (file instanceof TFile) {
													leaf?.openFile(file);
												}
											}}
										>
											<Icon name="file" />
											<span className="beautitab-recentlyedited-file-name">
												{file.basename}
											</span>
										</a>
									)
							)}
						</div>
					)}
					{settings.showBookmarks && (
						<div className="beautitab-recentlyedited">
							{bookmarks?.map(
								(file: TFile) =>
									file && (
										<a
											key={file.path}
											className="beautitab-recentlyedited-file"
											data-path={file.path}
											onClick={() => {
												const leaf =
													obsidian?.workspace.getMostRecentLeaf();
												if (file instanceof TFile) {
													leaf?.openFile(file);
												}
											}}
										>
											<Icon name="bookmark" />
											<span className="beautitab-recentlyedited-file-name">
												{file.basename}
											</span>
										</a>
									)
							)}
						</div>
					)}
				</div>
				<div className="beautitab-quote">
					{quote && settings.showQuote && (
						<div className="beautitab-quote-content">
							&quot;{quote.content}&quot;
						</div>
					)}
					{quote && settings.showQuote && (
						<div className="beautitab-quote-author">
							{quote.author}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default App;
