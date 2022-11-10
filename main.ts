import {
	MarkdownView,
	Plugin,
	ButtonComponent,
	PluginSettingTab,
	App,
	Setting,
} from "obsidian";
import { ScrollToTopSettingType, scrollToTopSetting } from "./src/setting";

const ROOT_WORKSPACE_CLASS = ".mod-vertical.mod-root";

export default class ScrollToTopPlugin extends Plugin {
	// scroll to top settings
	settings: ScrollToTopSettingType;
	// manage popup window
	windowSet: Set<Window> = new Set();

	private scrollToTop() {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			const preview = markdownView.previewMode;

			editor.exec("goStart");
			preview && preview.applyScroll(0);
		}
	}

	private scrollToBottom() {
		const markdownView =
			this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			const preview = markdownView.previewMode;

			editor.exec("goEnd");
			// the way to solve preview scroll to bottom
			if (preview) {
				let timer = setInterval(() => {
					const prevScroll = preview.getScroll();
					preview.applyScroll(preview.getScroll() + 10);
					if (prevScroll >= preview.getScroll()) {
						clearInterval(timer);
					}
				});
			}
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

		curWindow.document.addEventListener("click", function (event) {
			const activeLeaf = app.workspace.getActiveViewOfType(MarkdownView);

			if (activeLeaf) {
				topWidget.style.visibility = "visible";
			} else {
				topWidget.style.visibility = "hidden";
			}
		});
	}

	public removeButton(id: string, curWindow?: Window) {
		let curWin = curWindow || window;
		const element = curWin.document.getElementById(id);
		if (element) {
			element.remove();
		}
	}

	public createButton(window?: Window) {
		const {
			enabledScrollToTop,
			enabledScrollToBottom,
			iconScrollToTop,
			iconScrollToBottom,
			showTooltip,
			scrollTopTooltipText,
			scrollBottomTooltipText,
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
	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ScrollToTopSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(() => {
			this.createButton();
		});

		// add popup window support
		this.app.workspace.on("window-open", (win, window) => {
			this.windowSet.add(window);
			this.createButton(window);
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
		// for popup window
		if (this.windowSet.size > 0) {
			this.windowSet.forEach((window) => {
				this.removeButton("__C_scrollToTop", window);
				this.removeButton("__C_scrollToBottom", window);
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
		const span = document.createElement("span");
		span.innerText = text;
		const link = document.createElement("a");
		link.href = href;
		link.innerText = linkText;
		span.appendChild(link);

		return span;
	}

	rebuildButton() {
		this.plugin.removeButton("__C_scrollToTop");
		this.plugin.removeButton("__C_scrollToBottom");
		this.plugin.createButton();
		// for popup window
		if (this.plugin.windowSet.size > 0) {
			this.plugin.windowSet.forEach((window) => {
				this.plugin.removeButton("__C_scrollToTop", window);
				this.plugin.removeButton("__C_scrollToBottom", window);
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
			.setName("Change icon of scroll to top button")
			.setDesc(
				this.createSpanWithLinks(
					"Change icon of scroll to top button. You can visit available icons here: ",
					"https://github.com/mgmeyers/obsidian-icon-swapper",
					"obsidian-icon-swapper"
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
					"https://github.com/mgmeyers/obsidian-icon-swapper",
					"obsidian-icon-swapper"
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
	}
}
