// SSR 入口：导出各页面的 render 函数，供 SsrPlugin 调用
import React from 'react';
import { renderToString } from 'react-dom/server';

import IndexPage from './pages/index';
import PostPage from './pages/post';
import FriendsPage from './pages/friends';

export function renderIndex() {
    return renderToString(React.createElement(IndexPage));
}

export function renderPost() {
    return renderToString(React.createElement(PostPage));
}

export function renderFriends() {
    return renderToString(React.createElement(FriendsPage));
}
