import { BackgroundTheme } from "./Enums";
import type {i18n} from "i18next";

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

declare global {
	const i18next: i18n;
  }