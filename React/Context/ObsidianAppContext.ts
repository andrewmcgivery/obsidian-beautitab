import { createContext, useContext } from "react";
import { App } from "obsidian";

export const ObsidianContext = createContext<App | undefined>(undefined);

export const useObsidian = (): App | undefined => {
	return useContext(ObsidianContext);
};
