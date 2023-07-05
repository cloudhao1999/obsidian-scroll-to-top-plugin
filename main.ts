import {
	MarkdownView,
	Plugin,
	ButtonComponent,
	PluginSettingTab,
	App,
	Setting,
} from "obsidian";
import { ScrollToTopSettingType, scrollToTopSetting } from "./src/setting";
import {
	injectSurfingComponent,
	isContainSurfingWebview,
} from "plugins/surfing";

const ROOT_WORKSPACE_CLASS = ".mod-vertical.mod-root";

export default class ScrollToTopPlugin extends Plugin {
	// scroll to top settings
	settings: ScrollToTopSettingType;
	// manage popup window
	windowSet: Set<Window> = new Set();

	private addPluginCommand(id: string, name: string, callback: () => void) {
		this.addCommand({
			id,
			name,
			callback,
		});
	}

	private scrollToCursor() {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
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
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const preview = markdownView.previewMode;
			if (!this.isPreview(markdownView)) {
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
				this.isPreview(markdownView) && preview.applyScroll(0);
			}
		} else if (isContainSurfingWebview(this.settings)) {
			injectSurfingComponent(true);
		}
	}

	private scrollToBottom() {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const preview = markdownView.previewMode;
			if (!this.isPreview(markdownView)) {
				const editor = markdownView.editor;
				const lastLine = editor.lastLine();
				const lastLineChar = editor.getLine(lastLine).length;
				// cursor set to end
				setTimeout(async () => {
					editor.setCursor(lastLine, lastLineChar);
				}, 200);
				editor.scrollIntoView(
					{
						from: { line: lastLine, ch: 0 },
						to: { line: lastLine, ch: 0 },
					},
					true
				);
				this.app.workspace.setActiveLeaf(markdownView!.leaf, {
					focus: true,
				});
			} else {
				let timer = setInterval(() => {
					const prevScroll = preview.getScroll();
					preview.applyScroll(preview.getScroll() + 10);
					if (prevScroll >= preview.getScroll()) {
						clearInterval(timer);
					}
				});
			}
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

		let button = new ButtonComponent(topWidget);
		button.setIcon(config.icon).setClass("buttonItem").onClick(fn);

		if (config.tooltipConfig.showTooltip) {
			button.setTooltip(config.tooltipConfig.tooltipText);
		}

		let curWindow = config.curWindow || window;

		curWindow.document.body
			.querySelector(ROOT_WORKSPACE_CLASS)
			?.insertAdjacentElement("afterbegin", topWidget);

		const activeLeaf = app.workspace.getActiveViewOfType(MarkdownView);
		// uing activeLeaf was introducing bugs between different windows
		if (this.isNewTab() && !isContainSurfingWebview(this.settings)) {
			topWidget.style.visibility = "hidden";
		}
	}

	public isPreview(markdownView: MarkdownView) {
		const mode = markdownView.getMode();
		return mode === "preview";
	}

	public removeButton(id: string, curWindow?: Window) {
		let curWin = curWindow || window;
		const element = curWin.activeDocument.getElementById(id);
		if (element) {
			element.remove();
		}
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

	isNewTab() {
		const leaf = app.workspace.getLeaf(false);
		const viewState = leaf?.getViewState();
		const isMD = viewState.type == "markdown";
		const view = leaf?.view;
		return !isMD || view?.getViewType() === "empty";
	}

	toggleIconView() {
		const activeLeaf = app.workspace.getActiveViewOfType(MarkdownView);
		let BottomButton = activeDocument.querySelector(
			".div-scrollToBottom"
		) as HTMLElement;
		let TopButton = activeDocument.querySelector(
			".div-scrollToTop"
		) as HTMLElement;
		if (this.isNewTab() && !isContainSurfingWebview(this.settings)) {
			console.log("ici");
			if (BottomButton) BottomButton.style.visibility = "hidden";
			if (TopButton) TopButton.style.visibility = "hidden";
		} else {
			if (BottomButton) BottomButton.style.visibility = "visible";
			if (TopButton) TopButton.style.visibility = "visible";
		}
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ScrollToTopSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			this.createButton();

			// when opening new file
			this.registerEvent(
				this.app.workspace.on("file-open", () => {
					this.toggleIconView();
				})
			);
		});

		// expose plugin commands
		this.addPluginCommand(
			"scroll-to-top",
			"Scroll to Top",
			this.scrollToTop.bind(this)
		);
		this.addPluginCommand(
			"scroll-to-bottom",
			"Scroll to Bottom",
			this.scrollToBottom.bind(this)
		);
		this.addPluginCommand(
			"scroll-to-cursor",
			"Scroll to Cursor",
			this.scrollToCursor.bind(this)
		);
		// add popup window support
		this.app.workspace.on("window-open", (win, window) => {
			this.windowSet.add(window);
			this.createButton(window);
			this.toggleIconView();
		});
		this.app.workspace.on("window-close", (win, window) => {
			this.windowSet.delete(window);
		});

		setTimeout(() => {
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

class ScrollToTopSettingTab extends PluginSettingTab {
	plugin: ScrollToTopPlugin;

	constructor(app: App, plugin: ScrollToTopPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	createSpanWithLinks(text: string, href: string, linkText: string): any {
		const span = activeDocument.createElement("span");
		span.innerText = text;
		const link = activeDocument.createElement("a");
		link.href = href;
		link.innerText = linkText;
		span.appendChild(link);

		return span;
	}

	rebuildButton() {
		this.plugin.removeButton("__C_scrollToTop");
		this.plugin.removeButton("__C_scrollToBottom");
		this.plugin.removeButton("__C_scrollToCursor");
		this.plugin.createButton();
		// for popup window
		if (this.plugin.windowSet.size > 0) {
			this.plugin.windowSet.forEach((window) => {
				this.plugin.removeButton("__C_scrollToTop", window);
				this.plugin.removeButton("__C_scrollToBottom", window);
				this.plugin.removeButton("__C_scrollToCursor", window);
				this.plugin.createButton(window);
			});
		}
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();
		containerEl.createEl("h2", { text: "Scroll To Top Settings" });

		new Setting(containerEl)
			.setName("Show scroll to top button")
			.setDesc("Show scroll to top button in the right bottom corner.")
			.addToggle((value) => {
				value
					.setValue(this.plugin.settings.enabledScrollToTop)
					.onChange(async (value) => {
						this.plugin.settings.enabledScrollToTop = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Show scroll to bottom button")
			.setDesc("Show scroll to bottom button in the right bottom corner.")
			.addToggle((value) => {
				value
					.setValue(this.plugin.settings.enabledScrollToBottom)
					.onChange(async (value) => {
						this.plugin.settings.enabledScrollToBottom = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Show scroll to cursor button")
			.setDesc("Show scroll to cursor button in the right bottom corner.")
			.addToggle((value) => {
				value
					.setValue(this.plugin.settings.enabledScrollToCursor)
					.onChange(async (value) => {
						this.plugin.settings.enabledScrollToCursor = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Show Tooltip")
			.setDesc("Show tooltip when hover on the button.")
			.addToggle((value) => {
				value
					.setValue(this.plugin.settings.showTooltip)
					.onChange(async (value) => {
						this.plugin.settings.showTooltip = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Scroll on WebView (Beta)")
			.setDesc("Scroll on WebView (Should work with Surfing Plugin).")
			.addToggle((value) => {
				value
					.setValue(this.plugin.settings.enableSurfingPlugin)
					.onChange(async (value) => {
						this.plugin.settings.enableSurfingPlugin = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("tooltip config for top button")
			.setDesc("Change tooltip text of scroll to top button.")
			.addText((value) => {
				value
					.setValue(this.plugin.settings.scrollTopTooltipText)
					.onChange(async (value) => {
						this.plugin.settings.scrollTopTooltipText = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("tooltip config for bottom button")
			.setDesc("Change tooltip text of scroll to bottom button.")
			.addText((value) => {
				value
					.setValue(this.plugin.settings.scrollBottomTooltipText)
					.onChange(async (value) => {
						this.plugin.settings.scrollBottomTooltipText = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("tooltip config for cursor button")
			.setDesc("Change tooltip text of scroll to cursor button.")
			.addText((value) => {
				value
					.setValue(this.plugin.settings.scrollCursorTooltipText)
					.onChange(async (value) => {
						this.plugin.settings.scrollCursorTooltipText = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Change icon of scroll to top button")
			.setDesc(
				this.createSpanWithLinks(
					"Change icon of scroll to top button. You can visit available icons here: ",
					"https://lucide.dev/",
					"lucide.dev"
				)
			)
			.addText((value) => {
				value
					.setValue(this.plugin.settings.iconScrollToTop)
					.onChange(async (value) => {
						this.plugin.settings.iconScrollToTop = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Change icon of scroll to bottom button")
			.setDesc(
				this.createSpanWithLinks(
					"Change icon of scroll to bottom button. You can visit available icons here: ",
					"https://lucide.dev/",
					"lucide.dev"
				)
			)
			.addText((value) => {
				value
					.setValue(this.plugin.settings.iconScrollToBottom)
					.onChange(async (value) => {
						this.plugin.settings.iconScrollToBottom = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});

		new Setting(containerEl)
			.setName("Change icon of scroll to cursor button")
			.setDesc(
				this.createSpanWithLinks(
					"Change icon of scroll to cursor button. You can visit available icons here: ",
					"https://lucide.dev/",
					"lucide.dev"
				)
			)
			.addText((value) => {
				value
					.setValue(this.plugin.settings.iconScrollToCursor)
					.onChange(async (value) => {
						this.plugin.settings.iconScrollToCursor = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			});
	}
}
