import { ScrollToTopSettingType } from "../src/setting";

// judge if surfing plugin is enabled
export const isContainSurfingWebview = (settings: ScrollToTopSettingType) => {
	return settings.enableSurfingPlugin &&
		(activeDocument.querySelector(".wb-frame") ||
			activeDocument.querySelector(".wb-page-search-bar")
		);
}

export const injectSurfingComponent = (top: boolean = true) => {
	// surfing WebView plugin
	const webViewList = activeDocument.querySelectorAll("webview") as any;
	// fetch visiable webview
	const webView = Array.from(webViewList).find((item: any) => {
		// fetch display attr in parent workspace-leaf
		const workspaceLeafElem = item.parentElement.parentElement.parentElement
		const display = workspaceLeafElem.style?.display;
		const modActive = workspaceLeafElem.classList.contains("mod-active");
		return display != 'none' && modActive;
	}) as any;

	if (webView) {
		if (top) {
			webView.executeJavaScript(`window.scrollTo(0,0)`);
		} else {
			webView.executeJavaScript(
				`window.scrollTo(0,document.body.scrollHeight)`
			);
		}
	}
}
