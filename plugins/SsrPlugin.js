const fs = require('fs');
const path = require('path');

class SsrPlugin {
    /**
     * @param {Object} options
     * @param {string} options.ssrBundle - SSR bundle 的绝对路径
     * @param {string[]} options.pageNames - 需要 SSR 的页面名称列表
     * @param {string[]} options.staticPageNames - 静态页面名称列表（不含 post）
     * @param {Object} [options.ssrPostData] - 每个 post 页面的数据：{ [pageName]: { ...post,markdown } }
     * @param {Object} [options.tagsMap] - tag列表
     */
    constructor(options) {
        this.ssrBundle = options.ssrBundle;
        this.pageNames = options.pageNames;
        this.staticPageNames = options.staticPageNames || [];
        this.ssrPostData = options.ssrPostData || {};
        this.tagsMap = options.tagsMap || {};
        this.indexData = options.indexData || {};
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
                    const isStatic = this.staticPageNames.includes(name);
                    let props;
                    if (isStatic) {
                        props = { index_yaml: this.indexData, tagsMap: this.tagsMap };
                    } else {
                        props = this.ssrPostData[name] || null;
                    }
                    const appString = ssrModule.renderPage(name, props, this.tagsMap);

                    // SSR 渲染的组件替换占位符
                    html = html.replace('<div id="ssr"></div>', appString);

                    fs.writeFileSync(htmlPath, html, 'utf-8');
                    const renderedId = isStatic ? this.ssrPostData[name]?.id : name;
                    console.log(`[SsrPlugin] SSR rendered: ${isPost ? 'post/' + (renderedId || name) : name}.html`);
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
