import { MarkdownView, Plugin, ButtonComponent } from 'obsidian';

export default class MyPlugin extends Plugin {

	private scroolToTop() {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			if (editor) {
				editor.scrollTo(0, 0);
			}
			const preview = markdownView.previewMode;
			if (preview) {
				preview.applyScroll(0);

			}
		}
	}

	async onload() {
		this.addCommand({
			id: "scroll-to-top",
			name: "Scroll to top",
			callback: () => {
				this.scroolToTop();
			},
		});

		// 创建一个圆形的按钮，在右下角
		var topWidget = createEl("div");
		if (topWidget) {
			topWidget.setAttribute("style", `position: absolute; bottom: 4.25em; right: 2em; z-index: 99;`);
		}
		topWidget.setAttribute("id", "scrollToTop");
		var button = new ButtonComponent(topWidget);
		button.setIcon("arrow-up").setClass('buttonItem').setTooltip('返回顶部').onClick(() => {
			this.scroolToTop();
		});
		document.body
			.querySelector(".mod-vertical.mod-root")
			?.insertAdjacentElement("afterbegin", topWidget);

	}

	onunload() {

	}
}
