import React, { useEffect, useMemo, useState } from "react";
import { useObsidian } from "../../Context/ObsidianAppContext";
import { TFile, getIcon } from "obsidian";
import getTime from "React/Utils/getTime";
import Observable from "Utils/Observable";
import { BeautitabPluginSettings } from "main";
import getBackground from "React/Utils/getBackground";

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

const App = ({ settingsObservable }: { settingsObservable: Observable }) => {
	const [time, setTime] = useState(getTime());
	const [quote, setQuote] = useState<{
		content: string;
		author: string;
	} | null>(null);
	const [settings, setSettings] = useState<BeautitabPluginSettings>(
		settingsObservable.getValue()
	);
	const obsidian = useObsidian();
	const background = getBackground(
		settings.backgroundTheme,
		settings.customBackground
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

	/**
	 * Keep the time up to date by updating it every second
	 * Note that this shouldn't cause extra renders because calling "setTime" with a duplicate value should skip the render
	 */
	useEffect(() => {
		const timer = setInterval(() => {
			setTime(getTime());
		}, 1000);

		return () => {
			clearInterval(timer);
		};
	}, [setTime]);

	/**
	 * Get a random quote
	 */
	useEffect(() => {
		fetch("https://api.quotable.io/random").then(async (res) => {
			if (res.status === 200) {
				const response = await res.json();
				setQuote(response);
			}
		});
	}, [setQuote]);

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

	return (
		<div
			className="beautitab-root"
			style={{
				// @ts-ignore
				"--background": `url("${background}")`,
			}}
		>
			<div className="beautitab-wrapper">
				<div className="beautitab-top">
					{settings.showTopLeftSearchButton && (
						<a
							className="beautitab-iconbutton"
							onClick={() => {
								// @ts-ignore
								obsidian.commands.executeCommandById(
									settings.topLeftSearchProvider
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
							{settings.greetingText}
						</div>
					)}
				</div>
				<div className="beautitab-bottom">
					<div className="beautitab-search">
						{settings.showInlineSearch && (
							<a
								className="beautitab-search-wrapper"
								onClick={() => {
									// @ts-ignore
									obsidian.commands.executeCommandById(
										settings.inlineSearchProvider
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
