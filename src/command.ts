import {
	Plugin,
} from "obsidian";

export const addPluginCommand = (plugin: Plugin, id: string, name: string, callback: () => void) => {
	plugin.addCommand({
		id,
		name,
		callback,
	});
}
