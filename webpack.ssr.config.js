const path = require('path');

// SSR 专用 webpack 配置：编译出 Node.js 可执行的 bundle
module.exports = {
    target: 'node',
    entry: './src/ssr-entry.js',
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
                // 静态资源在 SSR 中不需要实际文件，返回空模块
                test: /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|eot)$/,
                use: 'null-loader',
            },
            {
                // CSS 样式在 SSR 中不需要处理
                test: /\.css$/,
                use: 'null-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    mode: 'production',
};
