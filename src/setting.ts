export interface ScrollToTopSettingType {
	enabledScrollToTop: boolean;
	enabledScrollToBottom: boolean;
	iconScrollToTop: string;
	iconScrollToBottom: string;
	showTooltip: boolean;
	scrollTopTooltipText: string;
	scrollBottomTooltipText: string;
}

export const scrollToTopSetting: ScrollToTopSettingType = {
	enabledScrollToTop: true,
	enabledScrollToBottom: true,
	iconScrollToTop: 'arrow-up',
	iconScrollToBottom: 'arrow-down',
	showTooltip: true,
	scrollTopTooltipText: 'Scroll to top',
	scrollBottomTooltipText: 'Scroll to bottom',
}
