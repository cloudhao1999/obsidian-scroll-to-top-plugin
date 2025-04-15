import { App } from 'obsidian';
import ScrollToTopPlugin from '../main';

/**
 * 检查 Homepage 插件是否存在
 */
export const isHomepagePluginLoaded = (app: App): boolean => {
    return !!(app as any).plugins?.plugins["homepage"];
}

/**
 * 检查是否需要应用 Homepage 兼容性样式
 */
export const needHomepageCompatibility = (): boolean => {
    const homepageElements = document.querySelectorAll(".scroll-to-top-homepage-compat");
    const homepageIcon = document.getElementById("nv-homepage-icon");
    return !!homepageIcon && homepageElements.length === 0;
}

/**
 * 向元素添加 Homepage 兼容性类
 */
export const addHomepageCompatibilityClass = (element: HTMLElement, app: App): void => {
    if (isHomepagePluginLoaded(app)) {
        element.classList.add("scroll-to-top-homepage-compat");
    }
}

/**
 * 处理 Homepage 插件兼容性
 */
export const handleHomepageCompatibility = (plugin: ScrollToTopPlugin): void => {
    if (!isHomepagePluginLoaded(plugin.app)) {
        return;
    }
    
    if (needHomepageCompatibility()) {
        // 重建带有兼容性样式的按钮
        plugin.removeButton("__C_scrollToTop");
        plugin.removeButton("__C_scrollToBottom");
        plugin.removeButton("__C_scrollToCursor");
        plugin.createButton();
    }
} 
