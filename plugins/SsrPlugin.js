const fs = require('fs');
const path = require('path');
const data_dir="src/data/";
class SsrPlugin {
    constructor(options) {
        this.pageNames = options.pageNames;
        this.staticPageNames = options.staticPageNames || [];
        this.indexData = options.indexData || {};
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('SsrPlugin', (compilation, callback) => {
            if (compiler.options.mode !== 'production') {
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
                    let appString="";
                    if(isPost)
                    {
                        const postId = name.replace('post_', '');
                        const mdPath = path.join(data_dir, `posts/${postId}.md`);
                        if (fs.existsSync(mdPath)) {
                            appString = fs.readFileSync(mdPath, 'utf-8');
                        } else {
                            console.warn(`[SsrPlugin] Markdown not found: ${mdPath}`);
                        }

                        const post = (this.indexData.posts || []).find(p => p.id === postId);
                        if (post && post.summary) {
                            html = html.replace('</title>', `</title>\n    <meta name="description" content="${post.summary.replace(/"/g, '&quot;')}" />`);
                        }
                    }

                    // SSR 渲染的组件替换占位符
                    html = html.replace('<div id="ssr"></div>', appString);

                    fs.writeFileSync(htmlPath, html, 'utf-8');
                    console.log(`[SsrPlugin] SSR rendered: ${name}.html`);
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
