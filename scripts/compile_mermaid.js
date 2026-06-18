const { Command } = require('commander');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { data_dir } = require('./config');

// 检查 mmdc 是否可用
try {
    execSync('mmdc --version', { stdio: 'ignore' });
} catch {
    console.error('mmdc 未安装，请运行: npm install -g @mermaid-js/mermaid-cli');
    process.exit(1);
}

const program = new Command();

program
    .argument('<id>', '文章 ID')
    .action(async (id) => {
        try {
            const postsDir = path.join(data_dir, 'posts');
            const mdPath = path.join(postsDir, `${id}.md`);

            // 读取 markdown 文件
            let content;
            try {
                content = await fs.readFile(mdPath, 'utf-8');
            } catch (err) {
                console.error(`未找到文章文件：${mdPath}`);
                process.exit(1);
            }

            // 逐行解析 mermaid 代码块
            const lines = content.split('\n');
            const blocks = [];
            let inMermaid = false;
            let currentBlockLines = [];

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('```mermaid')) {
                    inMermaid = true;
                    currentBlockLines = [];
                    continue;
                }
                if (inMermaid && trimmed === '```') {
                    blocks.push(currentBlockLines.join('\n').trim());
                    inMermaid = false;
                    currentBlockLines = [];
                    continue;
                }
                if (inMermaid) {
                    currentBlockLines.push(line);
                }
            }

            if (blocks.length === 0) {
                console.log(`文章 ${id} 中没有找到任何 mermaid 图表。`);
                return;
            }

            // 创建导出目录和临时目录
            const exportDir = path.join(data_dir, 'export', id);
            const tmpDir = path.join(data_dir, 'export', '.tmp_mermaid');
            await fs.mkdir(exportDir, { recursive: true });
            await fs.mkdir(tmpDir, { recursive: true });

            // 逐张渲染并导出
            for (let i = 0; i < blocks.length; i++) {
                const graphDef = blocks[i];
                const seq = String(i + 1).padStart(2, '0');
                const outputName = `mermaid-${seq}.png`;
                const outputPath = path.join(exportDir, outputName);
                const inputPath = path.join(tmpDir, `mermaid-${id}-${seq}.mmd`);

                // 写入临时 .mmd 文件
                await fs.writeFile(inputPath, graphDef, 'utf-8');

                // 用 mmdc 渲染为 PNG
                execSync(`mmdc -i "${inputPath}" -o "${outputPath}" -w 1600 --puppeteerConfigFile ${path.join(data_dir,"puppeteer-config.json")}`, { stdio: 'inherit' });

                // 删除临时文件
                await fs.unlink(inputPath);

                console.log(`已导出：${outputPath}`);
            }

            // 删除临时目录（如果为空）
            try { await fs.rmdir(tmpDir); } catch { /* 忽略，可能有其他临时文件 */ }
        } catch (err) {
            console.error('发生错误：', err.message);
            console.log(err);
            process.exit(1);
        }
    });

program.parse(process.argv);