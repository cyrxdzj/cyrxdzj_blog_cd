const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

class SitmapBuilder {
    constructor(options) {
        this.siteUrl = options.siteUrl;
    }

    apply(compiler) {
        compiler.hooks.afterEmit.tapAsync('SitmapBuilder', (compilation, callback) => {
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

            urls.push({
                loc: `${this.siteUrl}/`,
                priority: 1.0,
                changefreq: 'weekly',
            });

            urls.push({
                loc: `${this.siteUrl}/friends`,
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
            console.log('[SitmapBuilder] sitemap.xml generated');
            callback();
        });
    }
}

module.exports = SitmapBuilder;
