const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const { execSync } = require('child_process');

class SitemapBuilder {
    constructor(options) {
        this.siteUrl = options.siteUrl;
    }

    apply(compiler) {
            compiler.hooks.afterEmit.tapAsync('SitemapBuilder', (compilation, callback) => {
            if (compiler.options.mode !== 'production') {
                callback();
                return;
            }

            const outputPath = compilation.outputOptions.path;
            const indexYamlPath = path.join(compiler.context, 'src/data/index.yaml');

            if (!fs.existsSync(indexYamlPath)) {
                console.warn('[SitmapBuilder] index.yaml not found');
                callback();
                return;
            }

            const indexData = yaml.load(fs.readFileSync(indexYamlPath, 'utf-8'));
            const posts = indexData.posts || [];

            const urls = [];

            // 静态页面列表及其对应的源文件
            const staticPages = [
                { name: 'index', path: 'src/pages/index.jsx' },
                { name: 'friends', path: 'src/pages/friends.jsx' },
                { name: 'about', path: 'src/pages/about.jsx' },
            ];

            // 获取文件在 Git 中的最后提交时间
            function getGitLastCommitTime(filePath) {
                try {
                    const output = execSync(
                        `git log -1 --format=%aI "${filePath}"`,
                        { cwd: compiler.context, encoding: 'utf-8' }
                    ).trim();
                    return output || null;
                } catch {
                    return null;
                }
            }

            // 首页
            const indexLastmod = getGitLastCommitTime(staticPages[0].path);
            urls.push({
                loc: `${this.siteUrl}/`,
                lastmod: indexLastmod,
                priority: 1.0,
                changefreq: 'weekly',
            });

            // friends 页
            const friendsLastmod = getGitLastCommitTime(staticPages[1].path);
            urls.push({
                loc: `${this.siteUrl}/friends`,
                lastmod: friendsLastmod,
                priority: 0.8,
                changefreq: 'monthly',
            });

            // about 页
            const aboutLastmod = getGitLastCommitTime(staticPages[2].path);
            urls.push({
                loc: `${this.siteUrl}/about`,
                lastmod: aboutLastmod,
                priority: 0.8,
                changefreq: 'monthly',
            });

            posts.forEach(post => {
                urls.push({
                    loc: `${this.siteUrl}/post/${post.id}`,
                    lastmod: post.editTimeStr,
                    priority: 0.6,
                    changefreq: 'monthly',
                });
            });

            const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `    <lastmod>${new Date(u.lastmod).toISOString()}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

            const sitemapPath = path.join(outputPath, 'sitemap.xml');
            fs.writeFileSync(sitemapPath, sitemap, 'utf-8');
            console.log('[SitemapBuilder] sitemap.xml generated');
            callback();
        });
    }
}

module.exports = SitemapBuilder;
