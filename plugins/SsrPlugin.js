const fs = require('fs');
const path = require('path');

class SsrPlugin {
    /**
     * @param {Object} options
     * @param {string} options.ssrBundle - SSR bundle 的绝对路径
     * @param {string[]} options.pageNames - 需要 SSR 的页面名称列表
     * @param {string[]} options.staticPageNames - 静态页面名称列表（不含 post）
     * @param {Object} [options.ssrPostData] - 每个 post 页面的数据：{ [pageName]: { id, title, markdown } }
     */
    constructor(options) {
        this.ssrBundle = options.ssrBundle;
        this.pageNames = options.pageNames;
        this.staticPageNames = options.staticPageNames || [];
        this.ssrPostData = options.ssrPostData || {};
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('SsrPlugin', (compilation, callback) => {
            if (compiler.options.mode !== 'production') {
                callback();
                return;
            }

            let ssrModule;
            try {
                delete require.cache[this.ssrBundle];
                ssrModule = require(this.ssrBundle);
            } catch (err) {
                console.error('[SsrPlugin] Failed to load SSR bundle:', err.message);
                console.log(err);
                callback();
                return;
            }

            if (typeof ssrModule.renderPage !== 'function') {
                console.error('[SsrPlugin] SSR bundle must export renderPage(pageName, postData)');
                callback();
                return;
            }

            const outputPath = compilation.outputOptions.path;

            this.pageNames.forEach(name => {
                // 静态页面文件名直接用 name.html，post 页面在 post 子目录下
                const isPost = !this.staticPageNames.includes(name);
                let htmlPath;
                if (isPost) {
                    // name 如 post_welcome，对应 output post/welcome.html
                    const postId = name.replace('post_', '');
                    htmlPath = path.join(outputPath, 'post', `${postId}.html`);
                } else {
                    htmlPath = path.join(outputPath, `${name}.html`);
                }

                if (!fs.existsSync(htmlPath)) {
                    console.warn(`[SsrPlugin] HTML not found: ${htmlPath}`);
                    return;
                }

                let html = fs.readFileSync(htmlPath, 'utf-8');

                try {
                    const postData = this.ssrPostData[name] || null;
                    const appString = ssrModule.renderPage(name, postData);

                    // SSR 渲染的组件替换占位符
                    html = html.replace('<div id="ssr"></div>', appString);

                    fs.writeFileSync(htmlPath, html, 'utf-8');
                    console.log(`[SsrPlugin] SSR rendered: ${isPost ? 'post/' + (postData ? postData.id : name) : name}.html`);
                } catch (err) {
                    console.error(`[SsrPlugin] Error rendering ${name}:`, err.message);
                    console.log(err);
                }
            });

            callback();
        });
    }
}

module.exports = SsrPlugin;
