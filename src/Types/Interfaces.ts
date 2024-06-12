import { BackgroundTheme } from "./Enums";

export interface SearchProvider {
	command: string;
	display: string;
}

export interface CustomQuote {
	text: string;
	author: string;
}

export interface CachedBackground {
	url: string;
	date: Date;
	theme?: BackgroundTheme;
}