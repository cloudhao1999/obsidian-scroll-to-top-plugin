import ScrollToTopPlugin from "main";
import { ScrollToTopSettingType } from "types";
import { PluginSettingTab, App, Setting } from "obsidian";

export const scrollToTopSetting: ScrollToTopSettingType = {
	enabledScrollToTop: true,
	enabledScrollToBottom: true,
	enabledScrollToCursor: true,
	iconScrollToTop: "arrow-up",
	iconScrollToBottom: "arrow-down",
	iconScrollToCursor: "text-cursor-input",
	showTooltip: true,
	scrollTopTooltipText: "Scroll to top",
	scrollBottomTooltipText: "Scroll to bottom",
	scrollCursorTooltipText: "Scroll to cursor position",
	enableSurfingPlugin: false,
	resizeButton: 1,
};

export class ScrollToTopSettingTab extends PluginSettingTab {
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
			.setName("Resize buttons")
			.setDesc("Change size of buttons.")
			.addSlider((slider) => {
				slider
					.setLimits(0.7, 1.4, 0.1)
					.setValue(this.plugin.settings.resizeButton)
					.setDynamicTooltip()
					.onChange(async (value) => {
						this.plugin.settings.resizeButton = value;
						await this.plugin.saveSettings();
						this.rebuildButton();
					});
			})
			.addExtraButton((btn) => {
				btn.setIcon("reset")
					.setTooltip("Reset to default")
					.onClick(async () => {
						this.plugin.settings.resizeButton =
							scrollToTopSetting.resizeButton;
						await this.plugin.saveSettings();
						this.rebuildButton();
						this.display()
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
