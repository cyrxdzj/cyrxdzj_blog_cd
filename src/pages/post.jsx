import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import { createHighlighter } from 'shiki';
import JetBrainsMonoWoff2 from '../media/common/JetBrainsMono-Regular.woff2';
import { Affix, Button, Col, ConfigProvider, Flex, notification, Row, Spin, Tag, Tooltip, Tree, theme as antdTheme } from "antd";
import { AntdConfigProvider_light, formatTimestamp } from "../utils/utils";
import "../media/common/LXGWWenKai-Regular-Split/result.css"
import { Background, Text, Card, Paragraph, NextLine, Image, HeadNavigator } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";
import mermaid from 'mermaid';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons';

// 判断是否处于开发模式（localhost:3000）
const isDev = typeof window !== 'undefined' && window.location.port === '3000';

/**
 * 判断两个 URL 是否指向同一页面（忽略查询参数和锚点）
 * @param {string|Location} url1 - 第一个 URL 或 Location 对象
 * @param {string|Location} url2 - 第二个 URL 或 Location 对象
 * @returns {boolean} 若去除 ? 和 # 后相同则返回 true
 */
function is_same_page(url1, url2) {
    if (!url1 || !url2) return true;
    const normalize = (url) => String(url).split('?')[0].split('#')[0];
    const norm1 = normalize(url1);
    const norm2 = normalize(url2);
    if (!norm1 || !norm2) return true;
    return norm1 === norm2;
}

/**
 * 将文本转换为 URL 友好的 ID（用于标题锚点）
 */
function slugify(text) {
    return String(text)
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')
        || 'heading';
}

/**
 * 从 React children 中提取纯文本
 */
function extractTextFromChildren(children) {
    if (typeof children === 'string') return children;
    if (Array.isArray(children)) return children.map(c => typeof c === 'string' ? c : extractTextFromChildren(c)).join('');
    if (children?.props?.children) return extractTextFromChildren(children.props.children);
    return '';
}

/**
 * 从 Markdown 原文中移除代码块和内联代码内容，避免其中的 # 被误识别为标题
 * @param {string} markdown - Markdown 原文
 * @returns {string} 移除代码块和内联代码后的文本
 */
function stripCodeBlocks(markdown) {
    // 移除围栏代码块（``` 或 ~~~ 包裹的内容）
    let result = markdown.replace(/^(```|~~~)[\s\S]*?^\1$/gm, '');
    // 移除内联代码（`...` 包裹的内容）
    result = result.replace(/`[^`]*`/g, '');
    return result;
}

/**
 * 从 Markdown 原文中提取所有标题（用于构建目录树）
 * @param {string} markdown - Markdown 原文
 * @returns {{level:number, text:string, id:string}[]}
 */
function extractHeadings(markdown) {
    if (!markdown) return [];
    // 先移除代码块和内联代码，避免其中的 # 被误识别为标题
    const cleanedMarkdown = stripCodeBlocks(markdown);
    const headingRegex = /^(#{1,6})\s+(.+)$/gm;
    const headings = [];
    const idCounter = {};
    let match;
    while ((match = headingRegex.exec(cleanedMarkdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        let id = slugify(text);
        if (idCounter[id] !== undefined) {
            idCounter[id]++;
            id = 'heading-' + id + '-' + idCounter[id];
        } else {
            idCounter[id] = 0;
            id = 'heading-' + id;
        }
        headings.push({ level, text, id });
    }
    return headings;
}

/**
 * 将扁平的标题列表转换为 Ant Design Tree 所需的嵌套树结构
 * @param {{level:number, text:string, id:string}[]} headings
 * @returns {{title:string, key:string, children:[]}[]}
 */
function buildTreeData(headings) {
    const root = { title: 'root', key: 'root', children: [] };
    const stack = [{ level: 0, node: root }];

    for (const h of headings) {
        const newNode = {
            title: h.text,
            key: h.id,
        };

        while (stack.length > 1 && stack[stack.length - 1].level >= h.level) {
            stack.pop();
        }

        if (!stack[stack.length - 1].node.children) {
            stack[stack.length - 1].node.children = [];
        }
        stack[stack.length - 1].node.children.push(newNode);
        stack.push({ level: h.level, node: newNode });
    }

    return root.children;
}

/**
 * 创建 ReactMarkdown 标题渲染组件映射，每个标题都带有唯一 id 属性
 * 用于在生成 DOM 元素时注入 id，以便目录树可以通过 id 定位并滚动到对应位置
 */
function createHeadingRenderers(colorPrimary, notificationAPI) {
    const counters = {};
    const renderers = {};
    for (let level = 1; level <= 6; level++) {
        const type = 'h' + level;
        renderers[type] = function HeadingRenderer({ node, ...props }) {
            const [isHovered, setIsHovered] = useState(false);
            const idRef = useRef(null);
            if (idRef.current === null) {
                const text = extractTextFromChildren(props.children);
                const baseId = slugify(text);
                if (counters[baseId] === undefined) {
                    counters[baseId] = 0;
                } else {
                    counters[baseId]++;
                }
                idRef.current = counters[baseId] === 0 ? 'heading-' + baseId : 'heading-' + baseId + '-' + counters[baseId];
            }
            const id = idRef.current;
            return (
                <>
                    <div id={id}>
                        <Tooltip title="复制链接">
                            <Text
                                type={type}
                                {...props}
                                custom_style={{ cursor: 'pointer', color: isHovered ? colorPrimary : undefined, transition: 'color 0.5s' }}
                                onClick={() => {
                                    const url = window.location.href.split('#')[0] + '#' + id;
                                    navigator.clipboard.writeText(url).then(() => {
                                        notificationAPI.success({ message: '复制成功', placement: 'topLeft' });
                                    }).catch(() => {});
                                }}
                                onMouseEnter={() => setIsHovered(true)}
                                onMouseLeave={() => setIsHovered(false)}
                            />
                        </Tooltip>
                    </div>
                    <NextLine size='0px' />
                </>
            );
        };
    }
    return renderers;
}

/**
 * 保留 react-markdown 默认渲染的表格内容（内联代码、数学公式等已正确处理），
 * 递归遍历 th/td 并叠加 Ant Design 主题的内联样式，使外观接近 Ant Design Table。
 */
function AntTable({ node, children }) {
    const { token } = antdTheme.useToken();
    const borderColor = token.colorBorderSecondary;
    const headerBg = token.colorBgLayout;
    const cellPadding = '8px 12px';

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        margin: '16px 0',
        border: `1px solid ${borderColor}`,
        fontSize: token.fontSize,
        color: token.colorText,
    };

    const applyStyles = (element, isHeader) => {
        if (!React.isValidElement(element)) return element;
        const tagName = typeof element.type === 'string' ? element.type : '';

        if (tagName === 'th' || tagName === 'td') {
            return React.cloneElement(element, {
                style: {
                    ...(element.props.style || {}),
                    padding: cellPadding,
                    borderBottom: `1px solid ${borderColor}`,
                    ...(isHeader ? { background: headerBg, fontWeight: 'bold' } : {}),
                }
            });
        }

        const newIsHeader = isHeader || tagName === 'thead';
        return React.cloneElement(element, {
            children: React.Children.map(element.props.children, child =>
                applyStyles(child, newIsHeader)
            )
        });
    };

    if (!children) {
        // 无 children 时降级为原生表格
        return <table style={tableStyle}>{node?.children}</table>;
    }

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={tableStyle}>
                {React.Children.map(children, child => applyStyles(child, false))}
            </table>
        </div>
    );
}

// 全局异步创建高亮器实例（共享）
const highlighterPromise = createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: ['javascript', 'typescript', 'python', 'html', 'css', 'jsx', 'tsx', 'json', 'bash', 'markdown', 'text', 'yaml', 'xml', 'sql', 'c', 'cpp', 'java', 'rust', 'go', 'php', 'ruby', 'swift', 'kotlin', 'scala', 'solidity', 'docker']
});

/**
 * 使用 Mermaid 渲染图表代码块的组件
 */
function MermaidChart({ children }) {
    const containerRef = useRef(null);
    const [html, setHtml] = useState(null);
    const [error, setError] = useState(null);
    const id = useMemo(() => `mermaid-${Math.random().toString(36).substr(2, 9)}`, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const { svg } = await mermaid.render(id, String(children));
                if (!cancelled) setHtml(svg);
            } catch (err) {
                if (!cancelled) setError(err.message);
            }
        })();
        return () => { cancelled = true; };
    }, [children, id]);

    // 导出 Mermaid 图表为 PNG 图片
    const exportAsImg = useCallback(async () => {
        const target = containerRef.current;
        if (!target) return;
        try {
            const canvas = await html2canvas(target, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
            });
            canvas.toBlob((blob) => {
                if (blob) {
                    const downloadUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = downloadUrl;
                    a.download = `mermaid-${id}.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(downloadUrl);
                }
            }, 'image/png');
        } catch (err) {
            console.error('导出 Mermaid 图片失败:', err);
        }
    }, [id]);

    if (error) {
        return <pre style={{ color: 'red', padding: '10px', background: '#fdd' }}>Mermaid 渲染失败: {error}<br/>{children}</pre>;
    }
    if (!html) {
        return <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>加载 Mermaid 图表中…</div>;
    }
    return (
        <Flex vertical style={{ position: 'relative', margin: '16px 0' }}>
            <div ref={containerRef} style={{ textAlign: 'center', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />
            <Flex justify="end" style={{ position: 'absolute', bottom: 8, right: 8 }}>
                <Button size="small" onClick={exportAsImg}>导出为图片</Button>
            </Flex>
        </Flex>
    );
}

/**
 * 使用 Shiki 渲染代码块的组件（含 Mermaid 图表支持）
 */
function CodeBlock({ children, className }) {
    const inline = !String(children).includes('\n');
    const { token } = antdTheme.useToken();
    const containerRef = useRef(null);
    const [html, setHtml] = useState(null);
    const language = className?.replace('language-', '') || 'text';
    const codeStyle = {
        background: token.colorBgBase,
        borderRadius: '10px',
        padding: inline ? '2px 2px' : '10px 10px',
        overflow: 'auto',
        fontFamily: ["Jetbrains Mono","monospace"]
    };

    // 所有 hooks 必须在任何条件早返回之前注册，否则多个相同 CodeBlock 实例跨渲染时
    // 走不同分支会导致 "Rendered fewer hooks than expected" 错误
    useEffect(() => {
        if (inline || language === 'mermaid') return;
        let cancelled = false;
        (async () => {
            const highlighter = await highlighterPromise;
            if (cancelled) return;
            const theme = token.dark ? 'github-dark' : 'github-light';
            const result = highlighter.codeToHtml(String(children), {
                lang: language,
                theme: theme,
                lineNumbers: true,
            });
            if (!cancelled) setHtml(result);
        })();
        return () => { cancelled = true; };
    }, [children, language, token.dark, inline]);

    // 高亮器就绪后，将内部 pre 的背景设为透明以继承容器背景色
    useEffect(() => {
        if (inline || language === 'mermaid' || !html || !containerRef.current) return;
        const pre = containerRef.current.querySelector('pre');
        if (pre) {
            pre.style.background = 'transparent';
            pre.style.margin = '0px';
            //设置字体
            pre.style.fontFamily = ["Jetbrains Mono","monospace"];
            containerRef.current.querySelectorAll("code").forEach((ele)=>{
                ele.style.fontFamily = ["Jetbrains Mono","monospace"];
            });
        }
    }, [html, inline, language]);

    // 内联代码：使用 <code> 标签 + 样式的行内风格
    if (inline) {
        return <code className={className} style={codeStyle}>{children}</code>;
    }

    // Mermaid 图表：使用专门的渲染组件
    if (language === 'mermaid') {
        return <MermaidChart>{children}</MermaidChart>;
    }

    if (!html) {
        // fallback: 未加载完成时展示纯文本
        return <pre style={codeStyle}><code className={className} style={{"fontFamily":["Jetbrains Mono","monospace"]}}>{children}</code></pre>;
    }

    return <div ref={containerRef} style={codeStyle} dangerouslySetInnerHTML={{ __html: html }} />;
}

// 博文详情页组件，接收 post 对象（含 id, title, markdown）
function PostPage({ post, indexData = { tags: {} } }) {
    document.title=`${post?.title} - cyrxdzj的博客`
    const [notificationAPI, contextHolder] = notification.useNotification();
    const { token } = antdTheme.useToken();
    const cardRef = useRef(null);
    const backgroundRef = useRef(null);
    const [affixOffset, setAffixOffset] = useState(0);
    // 存储当前渲染用的 Markdown 原文
    const [markdownContent, setMarkdownContent] = useState(post?.markdown || '');
    // 渲染 Markdown 的 JSX
    const [renderedMarkdown,setRenderedMarkdown] =useState(null);
    // 是否正在生成 PDF
    const [isExporting, setIsExporting] = useState(false);

    // 开发模式下动态加载 Markdown 文件
    useEffect(() => {
        if (!isDev || !post?.id) return;
        let cancelled = false;
        (async () => {
            try {
                const resp = await fetch(`/posts/md/${post.id}.md`);
                if (cancelled) return;
                if (resp.ok) {
                    const text = await resp.text();
                    setMarkdownContent(text);
                } else {
                    console.warn(`开发模式加载 Markdown 失败: ${resp.status}`);
                }
            } catch (err) {
                console.warn('开发模式加载 Markdown 出错:', err);
            }
        })();
        return () => { cancelled = true; };
    }, [post?.id]);

    // 当 Markdown 内容变化时重新渲染
    useEffect(() => {
        setRenderedMarkdown(<ConfigProvider theme={AntdConfigProvider_light}>
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={{
                ...createHeadingRenderers(AntdConfigProvider_light.token.colorPrimary, notificationAPI),
                a:({node, ...props}) => <><a href={props.href} target={is_same_page(props.href,window?.location?.href)?"_self":"_blank"}><Text link>{props.children}</Text></a></>,
                p:({node, ...props}) => <Paragraph {...props}/>,
                strong:({node, ...props}) => <Text bold {...props}></Text>,
                li:({node, ...props}) => <li {...props} style={{"color":antdTheme.useToken().token.colorText}}>{props.children}</li>,
                img:({node, ...props}) => <Image {...props} fill_width/>,
                table: AntTable,
                code:CodeBlock,
                blockquote:({node, ...props}) => <blockquote {...props} style={{borderLeft:`2px solid ${AntdConfigProvider_light.token.colorPrimary}`, padding:'10px', margin:'16px 0', background:`linear-gradient(to right, ${AntdConfigProvider_light.token.colorBgContainer}, transparent)`}}/>,
            }}>{markdownContent}</ReactMarkdown>
        </ConfigProvider>);
    }, [markdownContent]);

    // 将隐藏的 Markdown 渲染区导出为 PDF 并下载
    const exportToPDF = useCallback(async () => {
        const container = document.getElementById('pdf-export-container');
        if (!container || isExporting) return;
        setIsExporting(true);
        try {
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                logging: false,
                onclone: (clonedDoc) => {
                    const clonedContainer = clonedDoc.getElementById('pdf-export-container');
                    if (clonedContainer) {
                        clonedContainer.style.opacity = '1';
                        clonedContainer.style.position = 'static';
                        clonedContainer.style.left = '0';
                    }
                }
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
            const imgWidth = pdfWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // 第一页
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;

            // 后续页
            while (heightLeft > 0) {
                position = heightLeft - imgHeight; // 向上偏移
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;
            }

            // 生成下载
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${post?.title || 'article'}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('导出 PDF 失败:', err);
        } finally {
            setIsExporting(false);
        }
    }, [post?.title, isExporting]);

    // 捕获 Ctrl+P 快捷键调用 exportToPDF
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                exportToPDF();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [exportToPDF]);

    useEffect(() => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setAffixOffset(rect.top);
        }
    }, []);

    // 从 Markdown 原文中提取标题，构建目录树数据
    const headingsData = useMemo(() => extractHeadings(markdownContent), [markdownContent]);
    const treeData = useMemo(() => buildTreeData(headingsData), [headingsData]);
    // 点击目录树节点时滚动到对应标题（考虑 affixOffset 避免被顶部元素遮挡）
    const handleTreeSelect = useCallback((selectedKeys) => {
        if (selectedKeys.length > 0) {
            const el = document.getElementById(selectedKeys[0]);
            const container = backgroundRef.current;
            if (el && container) {
                const containerRect = container.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const top = elRect.top - containerRect.top + container.scrollTop - affixOffset;
                container.scrollTo({ top, behavior: 'smooth' });
            }
        }
    }, [affixOffset]);

    // 对于当前文章每个 starred 标签，分别计算该标签下上一篇和下一篇
    const starTagNavData = useMemo(() => {
        if (!post?.tags || !indexData?.tags || !indexData?.posts) return [];
        const starredTagIds = post.tags.filter(tagId => indexData.tags[tagId]?.starred);
        if (starredTagIds.length === 0) return [];
        return starredTagIds.map(tagId => {
            const tagData = indexData.tags[tagId];
            const postsInTag = indexData.posts
                .map((p, idx) => ({ ...p, _origIndex: idx }))
                .filter(p => p.tags?.includes(tagId));
            const curIdx = postsInTag.findIndex(p => p.id === post.id);
            return {
                key: tagId,
                tagName: tagData.name,
                prevPost: curIdx > 0 ? postsInTag[curIdx - 1] : null,
                nextPost: curIdx >= 0 && curIdx < postsInTag.length - 1 ? postsInTag[curIdx + 1] : null,
            };
        });
    }, [post?.tags, post?.id, indexData?.tags, indexData?.posts]);

    // 页面加载时，如果 URL 包含 #xxx，则滚动到对应标题
    useEffect(() => {
        if (!renderedMarkdown) return;
        const hash = window.location.hash;
        if (!hash) return;
        const id = decodeURIComponent(hash.replace('#', ''));
        requestAnimationFrame(() => {
            const el = document.getElementById(id);
            const container = backgroundRef.current;
            if (el && container) {
                const containerRect = container.getBoundingClientRect();
                const elRect = el.getBoundingClientRect();
                const top = elRect.top - containerRect.top + container.scrollTop - affixOffset;
                container.scrollTo({ top, behavior: 'smooth' });
            }
        });
    }, [renderedMarkdown]);

    return (
        <ConfigProvider theme={AntdConfigProvider_light}>
            {contextHolder}
            <Background
                background_img={card_002_035_normal}
                background_img_size={{ "width": 2338, "height": 1440 }}
                title_logo={MainLogo}
                title={post?.title}
                title_end_component={
                    <HeadNavigator>
                        <HeadNavigator.Item
                            active={window.location.pathname === "/"}
                            onClick={() => window.location.href = "/"}
                        >
                            首页与文章列表
                        </HeadNavigator.Item>
                        <HeadNavigator.Item
                            active={window.location.pathname === "/about"}
                            onClick={() => window.location.href = "/about"}
                        >
                            关于我
                        </HeadNavigator.Item>
                    </HeadNavigator>
                }
                ref={backgroundRef}
            >
                <Row gutter={[8, 16]}>
                    <Col span={6}>
                        <Spin spinning={isExporting} tip="正在生成PDF">
                            <Card ref={cardRef}>
                                <Flex justify="center">
                                    <Text type={"h3"}>{post?.title}</Text>
                                </Flex>
                                <NextLine/>
                                <Flex justify="space-between" align="flex-start">
                                    <Flex vertical>
                                        <Text>{post?.editTimeStr ? formatTimestamp(new Date(post.editTimeStr).getTime()) : ''}</Text>
                                        <Text>{post?.length} 字</Text>
                                    </Flex>
                                    {post?.tags && post.tags.length > 0 && (
                                        <Flex gap={4} wrap style={{ justifyContent: "flex-end" }}>
                                            {post.tags.map(tagId => (
                                                <Tag key={tagId} color={AntdConfigProvider_light.token.colorPrimary} variant='solid'>{indexData.tags[tagId].name}</Tag>
                                            ))}
                                        </Flex>
                                    )}
                                </Flex>
                            </Card>
                        </Spin>
                        {treeData.length > 0 && (<>
                            <NextLine/>
                            <Affix offsetTop={affixOffset} target={()=>backgroundRef?.current}>
                                <Card>
                                    <Text type="h3">目录</Text>
                                    <Tree
                                        treeData={treeData}
                                        onSelect={handleTreeSelect}
                                        defaultExpandAll
                                        style={{ marginTop: 8 }}
                                    />
                                </Card>
                            </Affix></>
                        )}
                    </Col>
                    <Col span={18}>
                            <Card>
                                {renderedMarkdown}
                            </Card>
                            {starTagNavData.length > 0 && (<>
                                <NextLine/>
                                {starTagNavData.map(item => (
                                    <React.Fragment key={item.key}>
                                        <Row gutter={16} gutter={[8,16]}>
                                            <Col span={24}>
                                                <Card>
                                                    <Flex justify='center'><Text type="h3">{item.tagName}</Text></Flex>
                                                </Card>
                                            </Col>
                                            <Col span={12}>
                                                {item.prevPost ? (
                                                    <a href={`/post/${item.prevPost.id}`}>
                                                        <Card>
                                                            <Flex justify="space-between" align="flex-start">
                                                                <Flex vertical flex={1}>
                                                                    <Text type={"h3"}>{item.prevPost.title}</Text>
                                                                    <Text>{item.prevPost.summary}</Text>
                                                                </Flex>
                                                                <Flex vertical align="flex-end" style={{ whiteSpace: "nowrap" }}>
                                                                    <Text>{item.prevPost?.editTimeStr ? formatTimestamp(new Date(item.prevPost.editTimeStr).getTime()) : ''}</Text>
                                                                    <Text>{item.prevPost.length} 字</Text>
                                                                    {item.prevPost.tags && item.prevPost.tags.length > 0 && (
                                                                        <Flex gap={8} wrap style={{ justifyContent: "flex-end", marginTop: 8 }}>
                                                                            {item.prevPost.tags.map(tagId => (
                                                                                <Tag key={tagId} color={AntdConfigProvider_light.token.colorPrimary} variant="solid">{indexData.tags[tagId]?.name}</Tag>
                                                                            ))}
                                                                        </Flex>
                                                                    )}
                                                                    <Flex gap={8} wrap style={{marginTop:8}}>
                                                                        <Tag color={AntdConfigProvider_light.token.colorSuccess} variant="solid"><ArrowLeftOutlined/>上一篇</Tag>
                                                                    </Flex>
                                                                </Flex>
                                                            </Flex>
                                                        </Card>
                                                    </a>
                                                ) : (
                                                    <Card style={{ opacity: 0.4 }}>
                                                        <Flex justify="center" align="center" style={{ height: '100%', minHeight: 80 }}>
                                                            <Text type="secondary">已是第一篇</Text>
                                                        </Flex>
                                                    </Card>
                                                )}
                                            </Col>
                                            <Col span={12}>
                                                {item.nextPost ? (
                                                    <a href={`/post/${item.nextPost.id}`}>
                                                        <Card>
                                                            <Flex justify="space-between" align="flex-start">
                                                                <Flex vertical flex={1}>
                                                                    <Text type={"h3"}>{item.nextPost.title}</Text>
                                                                    <Text>{item.nextPost.summary}</Text>
                                                                </Flex>
                                                                <Flex vertical align="flex-end" style={{ whiteSpace: "nowrap" }}>
                                                                    <Text>{item.nextPost?.editTimeStr ? formatTimestamp(new Date(item.nextPost.editTimeStr).getTime()) : ''}</Text>
                                                                    <Text>{item.nextPost.length} 字</Text>
                                                                    {item.nextPost.tags && item.nextPost.tags.length > 0 && (
                                                                        <Flex gap={8} wrap style={{ justifyContent: "flex-end", marginTop: 8 }}>
                                                                            {item.nextPost.tags.map(tagId => (
                                                                                <Tag key={tagId} color={AntdConfigProvider_light.token.colorPrimary} variant="solid">{indexData.tags[tagId]?.name}</Tag>
                                                                            ))}
                                                                        </Flex>
                                                                    )}
                                                                    <Flex gap={8} wrap style={{marginTop:8}}>
                                                                        <Tag color={AntdConfigProvider_light.token.colorSuccess} variant="solid"><ArrowRightOutlined/>下一篇</Tag>
                                                                    </Flex>
                                                                </Flex>
                                                            </Flex>
                                                        </Card>
                                                    </a>
                                                ) : (
                                                    <Card style={{ opacity: 0.4 }}>
                                                        <Flex justify="center" align="center" style={{ height: '100%', minHeight: 80 }}>
                                                            <Text type="secondary">已是最后一篇</Text>
                                                        </Flex>
                                                    </Card>
                                                )}
                                            </Col>
                                        </Row>
                                        <NextLine/>
                                    </React.Fragment>
                                ))}
                            </>)}
                    </Col>
                </Row>
            </Background>
            <div id="pdf-export-container" style={{ opacity: 0, position: 'fixed', left: '-9999px', top: 0, width: '800px', padding:"80px"}}>
                <Flex justify="space-between" align="center" style={{ marginBottom: 16 }}>
                    <Flex vertical>
                        <Text type="h1">{post?.title}</Text>
                    </Flex>
                    {post?.logo_url && <Image src={post.logo_url} style={{ height: 50, width: 'auto' }} />}
                </Flex>
                {renderedMarkdown}
            </div>
        </ConfigProvider>
    );
}

export default PostPage;
