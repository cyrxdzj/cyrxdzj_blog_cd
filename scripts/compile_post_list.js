const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { OpenAI } = require("openai");
const config = require("./config");

let openai = null;
let hasCredentials = false;
try {
    const { apiKey } = require("./credentials");
    const { default: override_ca } = require("./override_ca");
    override_ca();
    openai = new OpenAI({
        baseURL: "https://cyrxdzj.io/llm/",
        apiKey: apiKey,
    });
    hasCredentials = true;
} catch (err) {
    console.warn("credentials.js 或 override_ca.js 加载失败，将跳过 AI 摘要生成:", err.message);
}

// 数据目录
const dataDir = config.data_dir;
const indexPath = path.join(dataDir, "index.yaml");
const postsDir = path.join(dataDir, "posts");

// 读取 index.yaml
let indexContent;
try {
    indexContent = fs.readFileSync(indexPath, "utf8");
} catch (err) {
    console.error(`无法读取 index.yaml: ${err.message}`);
    process.exit(1);
}

// 解析 YAML
let indexData;
try {
    indexData = yaml.load(indexContent);
} catch (err) {
    console.error(`解析 index.yaml 失败: ${err.message}`);
    process.exit(1);
}

if (!indexData || !Array.isArray(indexData.posts)) {
    console.error("index.yaml 中缺少 posts 字段或格式错误");
    process.exit(1);
}

// 主流程（使用 async IIFE 支持 await）
(async () => {
    for (const post of indexData.posts) {
        const id = post.id;
        if (!id) {
            console.warn("跳过缺少 id 的 post 项");
            continue;
        }
        const mdPath = path.join(postsDir, `${id}.md`);
        let stat;
        try {
            stat = fs.statSync(mdPath);
        } catch (err) {
            console.warn(`找不到 ${mdPath}，跳过`);
            continue;
        }

        // 是否需要生成摘要：没有 summary，或文件修改时间晚于已记录的 editTimeStr
        let needSummary = false;
        if (!post.summary) {
            needSummary = true;
        } else {
            const oldEditTime = post.editTimeStr;
            if (oldEditTime === undefined) {
                needSummary = true;
            } else {
                // 尝试将 oldEditTime 转为 Date（兼容字符串格式的旧数据）
                const oldDate = oldEditTime instanceof Date ? oldEditTime : new Date(oldEditTime);
                if (!isNaN(oldDate.getTime()) && stat.mtime > oldDate) {
                    needSummary = true;
                }
            }
        }

        // 读取 Markdown 内容
        const content = fs.readFileSync(mdPath, "utf8");

        if (needSummary) {
            if (hasCredentials) {
                try {
                    const response = await openai.chat.completions.create({
                        model: "deepseek-v4-flash",
                        messages: [
                            { role: "system", content: "你是一个文章摘要生成助手。请用一句话概括以下文章内容，不超过100个字。" },
                            { role: "user", content: content },
                        ],
                    });
                    const summary = response.choices[0].message.content.trim();
                    post.summary = summary;
                    console.log(`文章 "${id}" 已生成摘要: ${summary}`);
                } catch (err) {
                    console.warn(`生成摘要失败 (${id}): ${err.message}`);
                    console.log(err);
                }
            } else {
                // credentials 不可用，不调用 AI
                if (!post.summary) {
                    post.summary = ""; // 之前不存在，设为空字符串
                    console.log(`文章 "${id}" 摘要设为空字符串（无 AI 服务）`);
                }
                // 如果之前存在，则保持不变
            }
        }

        // 更新修改时间和字数
        post.editTimeStr = stat.mtime;
        post.length = content.length;
    }

    // 写回 index.yaml
    const outputYaml = yaml.dump(indexData, {
        indent: 2,
        lineWidth: -1,       // 不限制行宽
        noRefs: true,
        sortKeys: false
    });

    try {
        fs.writeFileSync(indexPath, outputYaml, "utf8");
        console.log("compile_post_list 完成，index.yaml 已更新。");
    } catch (err) {
        console.error(`写入 index.yaml 失败: ${err.message}`);
        process.exit(1);
    }
})();