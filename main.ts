import { MarkdownView, Plugin, ButtonComponent } from 'obsidian';

const ROOT_WORKSPACE_CLASS = '.mod-vertical.mod-root'

export default class MyPlugin extends Plugin {
	// max try times
	maxValue: number = 100;
	// current try times
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
			// stop when reach max try times
			if (this.maxValue < this.currentValue) return
			setTimeout(() => {
				this.createButton();
			}, 100)
			return
		}
		// create a button
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

		document.addEventListener("click", function (event) {
			const activeLeaf = app.workspace.getActiveViewOfType(MarkdownView);
			if (activeLeaf) {
				topWidget.style.visibility = "visible";
			} else {
				topWidget.style.visibility = "hidden";
			}
		});
	}

	async onload() {
		this.currentValue = 0;
		this.createButton();
	}

	onunload() {

	}
}
