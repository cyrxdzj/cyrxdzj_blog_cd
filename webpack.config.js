const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackBar = require('webpackbar');
const SsrPlugin = require('./plugins/SsrPlugin');

// 页面列表：用于生成多入口和多 HtmlWebpackPlugin
const pages = [
    { name: 'index', template: './src/public/index.html', entry: './src/entries/index.js' },
    { name: 'post', template: './src/public/post.html', entry: './src/entries/post.js' },
    { name: 'friends', template: './src/public/friends.html', entry: './src/entries/friends.js' },
];

module.exports = [
    // ===== 配置 1：SSR Bundle（Node 环境）=====
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
                    // SSR 中忽略样式
                    test: /\.css$/,
                    use: 'null-loader',
                },
                {
                    // SSR 中忽略图片/字体
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
    },

    // ===== 配置 2：前端 Bundle（Browser 环境）=====
    {
        entry: pages.reduce((acc, page) => {
            acc[page.name] = page.entry;
            return acc;
        }, {}),
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: '[name].js',
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
                    use: ['style-loader', 'css-loader'],
                },
                {
                    // YAML 文件以原始字符串形式导入
                    test: /\.yaml$/,
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
            // 为每个页面生成 HtmlWebpackPlugin
            ...pages.map(page => new HtmlWebpackPlugin({
                template: page.template,
                filename: `${page.name}.html`,
                chunks: [page.name],
            })),
            // SSR 注入插件
            new SsrPlugin({
                ssrBundle: path.resolve(__dirname, '.ssr-cache', 'ssr-bundle.js'),
                pageNames: pages.map(p => p.name),
            }),
        ],
        devServer: {
            port: 3000,
            hot: true,
            open: true,
        },
        resolve: {
            extensions: ['.js', '.jsx'],
        },
        mode: 'development',
    },
];

