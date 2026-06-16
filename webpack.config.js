const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const WebpackBar = require('webpackbar');
const SsrPlugin = require('./plugins/SsrPlugin');
const isDev = process.env.BUILD_MODE === 'development';

// 读取博文列表
const indexYaml = fs.readFileSync('./src/data/index.yaml', 'utf-8');
const indexData = yaml.load(indexYaml);
const posts = indexData.posts || [];

// 静态页面列表
const staticPages = [
    { name: 'index', template: './src/public/index.html', entry: './src/entries/index.js' },
    { name: 'friends', template: './src/public/friends.html', entry: './src/entries/friends.js' },
];

// 动态生成 post 页面条目
const postPages = posts.map(post => ({
    name: `post_${post.id}`,
    id: post.id,
    title: post.title,
    template: './src/public/post.html',
    entry: './src/entries/post.js',
}));

// 全部页面列表
const allPages = [
    ...staticPages,
    ...postPages.map(p => ({
        name: p.name,
        template: p.template,
        entry: p.entry,
    })),
];

// 构建 SSR 数据映射：供 SsrPlugin 使用
const ssrPostData = {};
postPages.forEach(p => {
    const mdPath = `./src/data/posts/${p.id}.md`;
    let markdown = '';
    if (fs.existsSync(mdPath)) {
        markdown = fs.readFileSync(mdPath, 'utf-8');
    }
    ssrPostData[p.name] = {
        ...p,        // 保留 index.yaml 中定义的所有字段（如 id, title 及未来添加的字段）
        markdown,    // 覆盖或添加 markdown 字段
    };
});
module.exports = [
    // ===== 配置 1：前端 Bundle（Browser 环境）=====
    {
        entry: allPages.reduce((acc, page) => {
            acc[page.name] = page.entry;
            return acc;
        }, {}),
        output: {
            path: path.resolve(__dirname, 'dist'),
            // 使用函数动态决定 JS 输出路径
            filename: (pathData) => {
                const chunkName = pathData.chunk && pathData.chunk.name;
                if (chunkName && chunkName.startsWith('post_')) {
                    return 'static/js/post/[name].js';
                }
                return 'static/js/[name].js';
            },
            chunkFilename: 'static/js/[name].[contenthash:8].js',
            assetModuleFilename: 'static/media/[name].[hash:8][ext]',
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader'],
                },
                {
                    test: /\.yaml$/,
                    type: 'asset/source',
                },
                {
                    test: /\.md$/,
                    type: 'asset/source',
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp|ico)$/i,
                    type: 'asset/resource',
                },
            ],
        },
        plugins: [
            new WebpackBar({
                name: 'Browser Build',
                color: '#000088',
            }),
            // 分离 CSS 到 static/css/
            new MiniCssExtractPlugin({
                filename: 'static/css/[name].css',
            }),
            // 静态页面
            ...staticPages.map(page => new HtmlWebpackPlugin({
                template: page.template,
                filename: `${page.name}.html`,
                chunks: [page.name],
            })),
            // post 页面：输出到 post/<id>.html
            ...postPages.map(page => new HtmlWebpackPlugin({
                template: page.template,
                filename: `post/${page.id}.html`,
                chunks: [page.name],
                // 自定义模板参数：注入 post 数据到 HTML
                templateParameters: (compilation, assets, assetTags, options) => {
                    const mdPath = `./src/data/posts/${page.id}.md`;
                    let markdown = '';
                    if (fs.existsSync(mdPath)) {
                        markdown = fs.readFileSync(mdPath, 'utf-8');
                    }
                    const postData = {
                        ...page,  // 包含 id, title, name 等所有 index.yaml 字段
                        markdown,
                    };
                    const dataScript = `<script>window.__INITIAL_STATE__ = ${JSON.stringify({ post: postData })};</script>`;
                    return {
                        postDataScript: dataScript,
                        documentTitle: `${page.title} - cyrxdzj的博客`,
                    };
                },
            })),
        ].concat(isDev?[]:[
            // SSR 注入插件 — 传入 post 数据
            new SsrPlugin({
                ssrBundle: path.resolve(__dirname, '.ssr-cache', 'ssr-bundle.js'),
                pageNames: allPages.map(p => p.name),
                staticPageNames: staticPages.map(p => p.name),
                ssrPostData,
            }),]),
        devServer: {
            port: 3000,
            hot: true,
            open: true,
            watchFiles: ['src/data/**/*'],
            historyApiFallback: {
                rewrites: posts.map(p => ({
                    from: new RegExp(`^/post/${p.id}$`),
                    to: `/post/${p.id}.html`,
                })),
            },
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        mode: 'development',
    },
].concat(isDev?[]:[
    // ===== 配置 2：SSR Bundle（Node 环境）=====
    {
        target: 'node',
        entry: ['./src/ssr-polyfill.js', './src/ssr-entry.js'],
        output: {
            path: path.resolve(__dirname, '.ssr-cache'),
            filename: 'ssr-bundle.js',
            libraryTarget: 'commonjs2',
            clean: true,
        },
        module: {
            rules: [
                {
                    test: /\.jsx?$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env', '@babel/preset-react'],
                        },
                    },
                },
                {
                    test: /\.css$/,
                    use: 'null-loader',
                },
                {
                    test: /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/,
                    use: 'null-loader',
                },
            ],
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        plugins: [
            new WebpackBar({
                name: 'SSR Build',
                color: '#000088',
            }),
        ],
        mode: 'production',
    }
]);