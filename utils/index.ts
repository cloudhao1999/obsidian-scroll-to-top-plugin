import { MarkdownView } from "obsidian";

export const isPreview = (markdownView: MarkdownView) => {
	const mode = markdownView.getMode();
	return mode === "preview";
}

export const isSource = (markdownView: MarkdownView) => {
	const mode = markdownView.getMode();
	return mode === "source";
}
