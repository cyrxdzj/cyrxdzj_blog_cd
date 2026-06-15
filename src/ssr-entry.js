// SSR 入口：导出统一的 renderPage 函数，供 SsrPlugin 调用
import React from 'react';
import { renderToString } from 'react-dom/server';

import IndexPage from './pages/index';
import PostPage from './pages/post';
import FriendsPage from './pages/friends';

// 页面组件映射
const pageComponents = {
    index: IndexPage,
    friends: FriendsPage,
};

/**
 * 根据页面名称和可选的博文数据进行 SSR 渲染
 * @param {string} pageName - 页面名称，post 类页面为 'post_<id>'
 * @param {Object|null} postData - 博文数据 { id, title, markdown }，非博文页面为 null
 * @returns {string} 渲染后的组件 HTML 字符串（不含数据脚本，由插件注入）
 */
export function renderPage(pageName, postData) {
    // 判断是否为 post 页面：pageName 以 'post_' 开头且 postData 非空
    const isPost = postData !== null && pageName.startsWith('post_');

    if (isPost) {
        return renderToString(React.createElement(PostPage, { post: postData }));
    }

    // 将 pageName 映射到静态页面组件
    const component = pageComponents[pageName];
    if (!component) {
        console.warn(`[SSR] Unknown page: ${pageName}, rendering fallback`);
        return '<div>Page not found</div>';
    }
    return renderToString(React.createElement(component));
}
