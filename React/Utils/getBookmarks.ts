import { BOOKMARK_SOURCE, BeautitabPluginSettings } from "main";
import { App, TAbstractFile } from "obsidian";

/**
 * Recursively gets all bookmarks
 * @param items
 */
const flattenBookmarks = (items: any[]) => {
	let flattedBookmarks: any[] = [];

	items.forEach((item) => {
		if (item.type === "file") {
			flattedBookmarks.push(item);
		} else if (item.type === "group") {
			flattedBookmarks = flattedBookmarks.concat(
				flattenBookmarks(item.items)
			);
		}
	});

	return flattedBookmarks;
};

/**
 * Finds a group by name and then returns it's bookmarks
 * @param title
 * @param items
 */
const getBookmarksByGroupName = (title: string, items: any[]) => {
	let flattedBookmarks: any[] = [];

	items.forEach((item) => {
		if (item.type === "group") {
			console.log(`Found group with title ${item.title}`);
			if (item.title === title) {
				console.log("found match!", item.items);
				flattedBookmarks = flattenBookmarks(item.items);
			} else {
				const bookmarks = getBookmarksByGroupName(title, item.items);
				if (bookmarks.length > 0) {
					flattedBookmarks = bookmarks;
				}
			}
		}
	});

	return flattedBookmarks;
};

/**
 * Gets a list of bookmarks depending on settings. It will either get all bookmarks or bookmarks in a specific group.
 * @param app
 * @param settings
 */
export const getBookmarks = (
	app: App | undefined,
	settings: BeautitabPluginSettings
): TAbstractFile[] => {
	// @ts-ignore
	let bookmarks = app?.internalPlugins.plugins.bookmarks.instance.items;

	if (settings.bookmarkSource === BOOKMARK_SOURCE.GROUP) {
		bookmarks = getBookmarksByGroupName(settings.bookmarkGroup, bookmarks);
	} else {
		bookmarks = flattenBookmarks(bookmarks);
	}

	const bookmarkFiles = bookmarks.map((bookmark: any) =>
		app?.vault.getAbstractFileByPath(bookmark.path)
	);

	return bookmarkFiles;
};

/**
 * Recursive function to return all bookmark groups with their paths
 * @param items
 * @param parentPath
 */
const flattenBookmarkGroups = (items: any[], parentPath = null) => {
	let flattedGroups: any[] = [];

	items.forEach((item) => {
		if (item.type === "group") {
			const path = parentPath
				? `${parentPath}/${item.title}`
				: item.title;
			flattedGroups.push({ title: item.title, path });
			flattedGroups = flattedGroups.concat(
				flattenBookmarkGroups(item.items, path)
			);
		}
	});

	return flattedGroups;
};

/**
 * Gets a list of all bookmark groups
 * @param app
 */
export const getBookmarkGroups = (app: App) => {
	// @ts-ignore
	let bookmarks = app?.internalPlugins.plugins.bookmarks.instance.items;

	return flattenBookmarkGroups(bookmarks);
};
