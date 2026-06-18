import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import "../media/common/LXGWWenKai-Regular-Split/result.css"
import { createHighlighter } from 'shiki';
import JetBrainsMonoWoff2 from '../media/common/JetBrainsMono-Regular.woff2';
import { Affix, Col, ConfigProvider, Flex, notification, Row, Table, Tag, theme as antdTheme } from "antd";
import { AntdConfigProvider_light, formatTimestamp } from "../utils/utils";
import { Background, Text, Card, Paragraph, NextLine, Image, HeadNavigator } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";
import mermaid from 'mermaid';

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
 * 将 Markdown 表格节点渲染为 Ant Design Table 组件
 */
function AntTable({ node }) {
    //console.log(node);
    // 提取表头行（thead 下的第一个 tr）
    const thead = node.children?.find(child => child.tagName === 'thead');
    const tbody = node.children?.find(child => child.tagName === 'tbody');

    if (!thead || !tbody) {
        // 降级为原生表格
        return <table>{node.children}</table>;
    }

    // 提取列定义
    const headerRow = thead.children?.find(child => child.tagName === 'tr');
    const columns = (headerRow?.children?.filter(child => child.tagName === 'th') || []).map((th, colIndex) => ({
        title: <Text bold>{extractText(th)}</Text>,
        dataIndex: `col${colIndex}`,
        key: `col${colIndex}`,
        align: th.properties?.align || 'left',
        render: (text) => <Text>{text}</Text>,
    })) || [];

    // 提取数据行
    const dataRows = (tbody.children?.filter(child => child.tagName === 'tr') || []);
    const dataSource = dataRows.map((tr, rowIndex) => {
        const row = { key: rowIndex };
        const cells = (tr.children?.filter(child => child.tagName === 'td') || []);
        cells.forEach((td, colIndex) => {
            row[`col${colIndex}`] = extractText(td);
        });
        return row;
    });

    //console.log(dataSource);

    return (
        <Table
            dataSource={dataSource}
            columns={columns}
            pagination={false}
            size="small"
            bordered
            style={{ margin: '16px 0' }}
        />
    );
}

/**
 * 提取节点内的纯文本（用于表格单元格）
 */
function extractText(node) {
    //if (typeof node === 'string') return node;
    if (node?.children) return node.children.map(extractText).join('');
    else return node.value;
    return '';
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
    // 生成稳定且合法的唯一 ID
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

    if (error) {
        return <pre style={{ color: 'red', padding: '10px', background: '#fdd' }}>Mermaid 渲染失败: {error}<br/>{children}</pre>;
    }
    if (!html) {
        return <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>加载 Mermaid 图表中…</div>;
    }
    return <div ref={containerRef} style={{ textAlign: 'center', margin: '16px 0', overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: html }} />;
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

    // 内联代码：使用 <code> 标签 + 样式的行内风格
    if (inline) {
        return <code className={className} style={codeStyle}>{children}</code>;
    }

    // Mermaid 图表：使用专门的渲染组件
    if (language === 'mermaid') {
        return <MermaidChart>{children}</MermaidChart>;
    }

    useEffect(() => {
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
    }, [children, language, token.dark]);

    // 高亮器就绪后，将内部 pre 的背景设为透明以继承容器背景色
    useEffect(() => {
        if (html && containerRef.current) {
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
        }
    }, [html]);

    if (!html) {
        // fallback: 未加载完成时展示纯文本
        return <pre style={codeStyle}><code className={className} style={{"fontFamily":["Jetbrains Mono","monospace"]}}>{children}</code></pre>;
    }

    return <div ref={containerRef} style={codeStyle} dangerouslySetInnerHTML={{ __html: html }} />;
}

// 博文详情页组件，接收 post 对象（含 id, title, markdown）
function PostPage({ post, tagsMap = {} }) {
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
        setRenderedMarkdown(<ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeRaw, rehypeKatex]} components={{
        h1:({node, ...props}) => <><Text type={"h1"} {...props}/><NextLine size='0px'/></>,
        h2:({node, ...props}) => <><Text type={"h2"} {...props}/><NextLine size='0px'/></>,
        h3:({node, ...props}) => <><Text type={"h3"} {...props}/><NextLine size='0px'/></>,
        h4:({node, ...props}) => <><Text type={"h4"} {...props}/><NextLine size='0px'/></>,
        h5:({node, ...props}) => <><Text type={"h5"} {...props}/><NextLine size='0px'/></>,
        h6:({node, ...props}) => <><Text type={"h6"} {...props}/><NextLine size='0px'/></>,
        a:({node, ...props}) => <><a href={props.href} target={is_same_page(props.href,window?.location?.href)?"_self":"_blank"}><Text link>{props.children}</Text></a></>,
        p:({node, ...props}) => <Paragraph {...props}/>,
        strong:({node, ...props}) => <Text bold {...props}></Text>,
        li:({node, ...props}) => <li {...props}>{props.children}</li>,
        img:({node, ...props}) => <Image {...props} fill_width/>,
        table:({node, ...props}) => <AntTable node={node} />,
        code:CodeBlock,
    }}>{markdownContent}</ReactMarkdown>);
    }, [markdownContent]);

    useEffect(() => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setAffixOffset(rect.top);
        }
    }, []);

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
                            active={window.location.pathname === "/friends"}
                            onClick={() => window.location.href = "/friends"}
                        >
                            友情链接
                        </HeadNavigator.Item>
                    </HeadNavigator>
                }
                ref={backgroundRef}
            >
                <Row gutter={[8, 16]}>
                    <Col span={8}>
                        <Affix offsetTop={affixOffset} target={()=>backgroundRef?.current}>
                            <Card ref={cardRef}>
                                <Flex justify="center">
                                    <Text type={"h1"}>{post?.title}</Text>
                                </Flex>
                                <NextLine/>
                                <Flex justify="space-between" align="flex-start">
                                    <Flex vertical>
                                        <Text>{formatTimestamp(post?.editTimeStr)}</Text>
                                        <Text>{post?.length} 字</Text>
                                    </Flex>
                                    {post?.tags && post.tags.length > 0 && (
                                        <Flex gap={4} wrap style={{ justifyContent: "flex-end" }}>
                                            {post.tags.map(tagId => (
                                                <Tag key={tagId} color={token.colorPrimary} variant='solid'>{tagsMap[tagId].name}</Tag>
                                            ))}
                                        </Flex>
                                    )}
                                </Flex>
                            </Card>
                        </Affix>
                    </Col>
                    <Col span={16}>
                        <Card>
                            {renderedMarkdown}
                        </Card>
                    </Col>
                </Row>
            </Background>
        </ConfigProvider>
    );
}

export default PostPage;
