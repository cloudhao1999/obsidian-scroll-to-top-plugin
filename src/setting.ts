export interface ScrollToTopSettingType {
	enabledScrollToTop: boolean;
	enabledScrollToBottom: boolean;
	enabledScrollToCursor: boolean;
	iconScrollToTop: string;
	iconScrollToBottom: string;
	iconScrollToCursor: string;
	showTooltip: boolean;
	scrollTopTooltipText: string;
	scrollBottomTooltipText: string;
	scrollCursorTooltipText: string;
	enableSurfingPlugin: boolean;
}

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
	scrollCursorTooltipText: "Scroll to cursor position (source mode only)",
	enableSurfingPlugin: false,
};
