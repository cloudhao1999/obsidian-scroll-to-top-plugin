import { MarkdownView, View, Plugin, ButtonComponent } from "obsidian";

import { addPluginCommand } from "./src/command";
import { isPreview, isSource } from "./utils";
import { ScrollToTopSettingType } from "types";
import { ScrollToTopSettingTab, scrollToTopSetting } from "./src/setting";
import {
	injectSurfingComponent,
	isContainSurfingWebview,
} from "plugins/surfing";
import {
	handleHomepageCompatibility,
	addHomepageCompatibilityClass
} from "plugins/homepage";

const ROOT_WORKSPACE_CLASS = ".mod-vertical.mod-root";
// solve the problem of closing always focus new tab setting 
let globalMarkdownView: MarkdownView | null = null;

export default class ScrollToTopPlugin extends Plugin {
	// scroll to top settings
	settings: ScrollToTopSettingType;
	// manage popup window
	windowSet: Set<Window> = new Set();

	private scrollToCursor() {
		const markdownView = this.getCurrentViewOfType();
		if (markdownView) {
			const editor = markdownView.editor;
			const anchor = editor.getCursor("anchor");
			const head = editor.getCursor("head");
			// setCursor or setSelection are doing a scroll (not centered) if out of view.
			// so with a timer the other scroll done, this scroll is ignored and of course cursor pos is updated
			setTimeout(async () => {
				editor.setSelection(anchor, head);
			}, 200);
			editor.scrollIntoView(
				{
					from: anchor,
					to: head,
				},
				true
			);
			// get back the focus on activeLeaf before to set the cursor (after timer)
			this.app.workspace.setActiveLeaf(markdownView!.leaf, {
				focus: true,
			});
		} else if (isContainSurfingWebview(this.settings)) {
			injectSurfingComponent(false);
		}
	}

	private scrollToTop() {
		const markdownView = this.getCurrentViewOfType();
		if (markdownView) {
			const preview = markdownView.previewMode;
			if (isSource(markdownView)) {
				const editor = markdownView.editor;
				// cursor set to start
				setTimeout(async () => {
					editor.setCursor(0, 0);
				}, 200);
				// not limited to the start of the editor text as with editor.exec("goStart");
				editor.scrollTo(0, 0);
				this.app.workspace.setActiveLeaf(markdownView!.leaf, {
					focus: true,
				});
			} else {
				isPreview(markdownView) && preview.applyScroll(0);
			}
		} else if (isContainSurfingWebview(this.settings)) {
			injectSurfingComponent(true);
		}
	}

	private scrollToBottom = async () => {
		const markdownView = this.getCurrentViewOfType();
		if (markdownView) {
			const file = this.app.workspace.getActiveFile()
			const content = await (this.app as any).vault.cachedRead(file);
			const lines = content.split('\n');
			let numberOfLines = lines.length;
			//in preview mode don't count empty lines at the end
			if (markdownView.getMode() === 'preview') {
				while (numberOfLines > 0 && lines[numberOfLines - 1].trim() === '') {
					numberOfLines--;
				}
			}
			markdownView.currentMode.applyScroll((numberOfLines - 1))
		} else if (isContainSurfingWebview(this.settings)) {
			injectSurfingComponent(false);
		}
	}

	private createScrollElement(
		config: {
			id: string;
			className: string;
			icon: string;
			curWindow?: Window;
			tooltipConfig: {
				showTooltip: boolean;
				tooltipText: string;
			};
		},
		fn: () => void
	) {
		let topWidget = createEl("div");
		topWidget.setAttribute("class", `div-${config.className}`);
		topWidget.setAttribute("id", config.id);
		document.body.style.setProperty("--size-ratio", this.settings.resizeButton.toString());

		let button = new ButtonComponent(topWidget);
		button.setIcon(config.icon).setClass("buttonItem").onClick(fn);

		if (config.tooltipConfig.showTooltip) {
			button.setTooltip(config.tooltipConfig.tooltipText);
		}

		let curWindow = config.curWindow || window;
		const markdownView = this.getCurrentViewOfType();

		// 使用 homepage.ts 中的函数添加兼容性类
		addHomepageCompatibilityClass(topWidget, this.app);

		curWindow.document.body
			.querySelector(ROOT_WORKSPACE_CLASS)
			?.insertAdjacentElement("afterbegin", topWidget);

		// fix bug when the leaf was pinned caused Obsidian stuck
		if (!markdownView && !isContainSurfingWebview(this.settings)) {
			topWidget.style.visibility = "hidden";
		}
	}

	public removeButton(id: string, curWindow?: Window) {
		let curWin = curWindow || window;
		const element = curWin.activeDocument.getElementById(id);
		if (element) {
			element.remove();
		}
	}

	public getCurrentViewOfType() {
		// get the current active view
		let markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		// To distinguish whether the current view is hidden or not markdownView
		let currentView = this.app.workspace.getActiveViewOfType(View) as MarkdownView;
		// solve the problem of closing always focus new tab setting
		if (markdownView !== null) {
			globalMarkdownView = markdownView;
		} else {
			// fix the plugin shutdown problem when the current view is not exist
			if (currentView == null || currentView?.file?.extension == "md") {
				markdownView = globalMarkdownView
			}
		}
		return markdownView;
	}

	public createButton(window?: Window) {
		const {
			enabledScrollToTop,
			enabledScrollToBottom,
			enabledScrollToCursor,
			iconScrollToTop,
			iconScrollToBottom,
			iconScrollToCursor,
			showTooltip,
			scrollTopTooltipText,
			scrollBottomTooltipText,
			scrollCursorTooltipText,
		} = this.settings;

		if (enabledScrollToTop) {
			// create a button
			this.createScrollElement(
				{
					id: "__C_scrollToTop",
					className: "scrollToTop",
					icon: iconScrollToTop,
					curWindow: window,
					tooltipConfig: {
						showTooltip,
						tooltipText: scrollTopTooltipText,
					},
				},
				this.scrollToTop.bind(this)
			);
		}

		if (enabledScrollToBottom) {
			this.createScrollElement(
				{
					id: "__C_scrollToBottom",
					className: "scrollToBottom",
					icon: iconScrollToBottom,
					curWindow: window,
					tooltipConfig: {
						showTooltip,
						tooltipText: scrollBottomTooltipText,
					},
				},
				this.scrollToBottom.bind(this)
			);
		}

		if (enabledScrollToCursor) {
			this.createScrollElement(
				{
					id: "__C_scrollToCursor",
					className: "scrollToCursor",
					icon: iconScrollToCursor,
					curWindow: window,
					tooltipConfig: {
						showTooltip,
						tooltipText: scrollCursorTooltipText,
					},
				},
				this.scrollToCursor.bind(this)
			);
		}
	}

	toggleIconView() {
		let BottomButton = activeDocument.querySelector(
			".div-scrollToBottom"
		) as HTMLElement;
		let TopButton = activeDocument.querySelector(
			".div-scrollToTop"
		) as HTMLElement;
		let CursorButton = activeDocument.querySelector(
			".div-scrollToCursor"
		) as HTMLElement;

		const markdownView = this.getCurrentViewOfType();
		if (!markdownView && !isContainSurfingWebview(this.settings)) {
			if (BottomButton) BottomButton.style.visibility = "hidden";
			if (TopButton) TopButton.style.visibility = "hidden";
			if (CursorButton) CursorButton.style.visibility = "hidden";
		} else {
			if (BottomButton) BottomButton.style.visibility = "visible";
			if (TopButton) TopButton.style.visibility = "visible";
			if (markdownView && isSource(markdownView)) {
				if (CursorButton) CursorButton.style.visibility = "visible";
			} else {
				if (CursorButton) CursorButton.style.visibility = "hidden";
			}
		}
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ScrollToTopSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			this.createButton();
			this.registerEvent(
				this.app.workspace.on("file-open", () => {
					this.toggleIconView();
					handleHomepageCompatibility(this);
				})
			)
			// add popup window support
			this.registerEvent(
				this.app.workspace.on("window-open", (win, window) => {
					this.windowSet.add(window);
					this.createButton(window);
					this.toggleIconView();
				})
			);
			this.registerEvent(
				this.app.workspace.on("window-close", (win, window) => {
					this.windowSet.delete(window);
				})
			)
			this.registerEvent(
				this.app.workspace.on("layout-change", () => {
					this.toggleIconView();
					// 当布局变化时处理 Homepage 兼容性
					handleHomepageCompatibility(this);
				})
			);
			
			// 初始检查 Homepage 兼容性
			handleHomepageCompatibility(this);
			
			// 额外延迟检查，以捕获较晚加载的 Homepage 插件
			setTimeout(() => {
				handleHomepageCompatibility(this);
			}, 3000);
		});

		// expose plugin commands
		addPluginCommand(
			this,
			"scroll-to-top",
			"Scroll to Top",
			this.scrollToTop.bind(this)
		);
		addPluginCommand(
			this,
			"scroll-to-bottom",
			"Scroll to Bottom",
			this.scrollToBottom.bind(this)
		);
		addPluginCommand(
			this,
			"scroll-to-cursor",
			"Scroll to Cursor",
			this.scrollToCursor.bind(this)
		);

		setTimeout(() => { //linked to commands added
			this.app.workspace.trigger("css-change");
		}, 300);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			scrollToTopSetting,
			await this.loadData()
		);
	}

	onunload() {
		this.removeButton("__C_scrollToTop");
		this.removeButton("__C_scrollToBottom");
		this.removeButton("__C_scrollToCursor");
		// for popup window
		if (this.windowSet.size > 0) {
			this.windowSet.forEach((window) => {
				this.removeButton("__C_scrollToTop", window);
				this.removeButton("__C_scrollToBottom", window);
				this.removeButton("__C_scrollToCursor", window);
			});
		}
	}
}
