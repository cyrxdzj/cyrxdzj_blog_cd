const fs = require('fs');
const path = require('path');

class SsrPlugin {
    /**
     * @param {Object} options
     * @param {string} options.ssrBundle - SSR bundle 的绝对路径
     * @param {string[]} options.pageNames - 需要 SSR 的页面名称列表
     */
    constructor(options) {
        this.ssrBundle = options.ssrBundle;
        this.pageNames = options.pageNames;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('SsrPlugin', (compilation, callback) => {
            if (compiler.options.mode !== 'production') {
                callback();
                return;
            }

            let ssrModule;
            try {
                // 清除缓存确保获取最新版本
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
                const htmlPath = path.join(outputPath, `${name}.html`);

                if (!fs.existsSync(htmlPath)) {
                    console.warn(`[SsrPlugin] HTML not found: ${htmlPath}`);
                    return;
                }

                let html = fs.readFileSync(htmlPath, 'utf-8');

                try {
                    // 对应 ssr-entry.js 中导出的 render${capitalize(name)} 函数
                    const renderFnName = `render${name.charAt(0).toUpperCase() + name.slice(1)}`;
                    const renderFn = ssrModule[renderFnName];
                    if (typeof renderFn !== 'function') {
                        console.warn(`[SsrPlugin] No export: ${renderFnName}`);
                        return;
                    }

                    const appString = renderFn();
                    html = html.replace('<div id="ssr"></div>', appString);
                    fs.writeFileSync(htmlPath, html, 'utf-8');
                    console.log(`[SsrPlugin] SSR rendered: ${name}.html`);
                } catch (err) {
                    console.error(`[SsrPlugin] Error rendering ${name}.html:`, err.message);
                    console.log(err);
                }
            });

            callback();
        });
    }
}

module.exports = SsrPlugin;
