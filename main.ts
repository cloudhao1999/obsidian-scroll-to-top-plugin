import { MarkdownView, Plugin, ButtonComponent } from 'obsidian';

const ROOT_WORKSPACE_CLASS = '.mod-vertical.mod-root'

export default class MyPlugin extends Plugin {
	// 最大尝试次数
	maxValue: number = 100;
	// 尝试次数
	currentValue: number = 0;

	private scroolToTop() {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			const preview = markdownView.previewMode;

			editor && editor.scrollTo(0, 0);
			preview && preview.applyScroll(0);
		}
	}

	private createButton() {
		this.currentValue++;

		if (!document.body.querySelector(ROOT_WORKSPACE_CLASS)) {
			// 尝试次数超过最大值，停止尝试
			if (this.maxValue < this.currentValue) return
			setTimeout(() => {
				this.createButton();
			}, 100)
			return
		}
		// 创建一个圆形的按钮，在右下角
		let topWidget = createEl("div");
		if (topWidget) {
			topWidget.setAttribute("style", `position: absolute; bottom: 4.25em; right: 2em; z-index: 99;`);
		}
		topWidget.setAttribute("id", "scrollToTop");

		let button = new ButtonComponent(topWidget);
		button.setIcon("arrow-up").setClass('buttonItem').setTooltip('返回顶部').onClick(() => {
			this.scroolToTop();
		});

		document.body
			.querySelector(ROOT_WORKSPACE_CLASS)
			?.insertAdjacentElement("afterbegin", topWidget);
	}

	async onload() {
		this.currentValue = 0;
		this.createButton();
	}

	onunload() {

	}
}
