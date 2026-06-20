import React from 'react';
import ReactDOM from 'react-dom/client';
import PostPage from '../pages/post';

// 读取 SSR 阶段注入的初始数据
const initialPost = window.__INITIAL_STATE__ && window.__INITIAL_STATE__.post;
const initialIndexData = window.__INITIAL_STATE__.indexData;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PostPage post={initialPost} indexData={initialIndexData}/>);
