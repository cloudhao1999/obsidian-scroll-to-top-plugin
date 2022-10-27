import { MarkdownView, Plugin, ButtonComponent, PluginSettingTab, App, Setting } from 'obsidian';
import { ScroolToTopSettingType, scroolToTopSetting } from './src/setting';

const ROOT_WORKSPACE_CLASS = '.mod-vertical.mod-root'

export default class MyPlugin extends Plugin {
	// max try times
	maxValue: number = 100;
	// current try times
	currentValue: number = 0;
	// scrool to top settings
	settings: ScroolToTopSettingType;

	private scroolToTop() {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			const preview = markdownView.previewMode;

			editor && editor.exec('goStart');
			preview && preview.applyScroll(0);
		}
	}

	private scroolToBottom() {
		const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
		if (markdownView) {
			const editor = markdownView.editor;
			const preview = markdownView.previewMode;

			editor && editor.exec('goEnd');
			// the way to solve preview scroll to bottom
			if (preview) {
				let timer = setInterval(() => {
					const prevScroll = preview.getScroll();
					preview.applyScroll(preview.getScroll() + 5);
					if (prevScroll === preview.getScroll()) {
						clearInterval(timer);
					}
				})
			}
		}
	}

	private crateScrollElement(config: {
		id: string,
		bottom: number,
		right: number,
		icon: string,
		tooltip: string,
	}, fn: () => void) {
		let topWidget = createEl("div");
			if (topWidget) {
				topWidget.setAttribute("style", `position: absolute; bottom: ${config.bottom}em; right: ${config.right}em; z-index: 99;`);
			}
			topWidget.setAttribute("id", config.id);

			let button = new ButtonComponent(topWidget);
			button.setIcon(config.icon).setClass('buttonItem').setTooltip(config.tooltip).onClick(() => {
				fn()
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

	private createButton() {
		this.currentValue++;

		const { enabledScroolToTop, enabledScroolToBottom } = this.settings

		if (!document.body.querySelector(ROOT_WORKSPACE_CLASS)) {
			// stop when reach max try times
			if (this.maxValue < this.currentValue) return
			setTimeout(() => {
				this.createButton();
			}, 100)
			return
		}
		if (enabledScroolToTop) {
			// create a button
			this.crateScrollElement({
				id: 'scrollToTop',
				bottom: 5.75,
				right: 2,
				icon: 'arrow-up',
				tooltip: 'Scroll to top',
			}, this.scroolToTop.bind(this))
		}

		if (enabledScroolToBottom) {
			this.crateScrollElement({
				id: 'scrollToBottom',
				bottom: 2.65,
				right: 2,
				icon: 'arrow-down',
				tooltip: 'Scroll to Bottom',
			}, this.scroolToBottom.bind(this))
		}

	}

	async onload() {
		await this.loadSettings();
		this.addSettingTab(new ScrollToTopSettingTab(this.app, this));
		this.currentValue = 0;
		this.createButton();
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async loadSettings() {
		this.settings = Object.assign({}, scroolToTopSetting, await this.loadData());
	}

	onunload() {

	}
}

class ScrollToTopSettingTab extends PluginSettingTab {
	plugin: MyPlugin;

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl('h2', { text: 'Scrool To Top Settings' });

		new Setting(containerEl)
			.setName('Show scroll to top button')
			.setDesc('Show scroll to top button in the right bottom corner.')
			.addToggle(value => {
				value.setValue(this.plugin.settings.enabledScroolToTop)
					.onChange(async (value) => {
						this.plugin.settings.enabledScroolToTop = value;
						await this.plugin.saveSettings();
					});
			})

		new Setting(containerEl)
			.setName('Show scroll to bottom button')
			.setDesc('Show scroll to bottom button in the right bottom corner.')
			.addToggle(value => {
				value.setValue(this.plugin.settings.enabledScroolToBottom)
					.onChange(async (value) => {
						this.plugin.settings.enabledScroolToBottom = value;
						await this.plugin.saveSettings();
					});
			})
	}
}
