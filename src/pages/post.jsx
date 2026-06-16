import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Affix, Col, ConfigProvider, Flex, notification, Row, Table } from "antd";
import { AntdConfigProvider_light } from "../utils/utils";
import { Background, Text, Card, Paragraph, NextLine, Image } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

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
    console.log(node);
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

    console.log(dataSource);

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

// 博文详情页组件，接收 post 对象（含 id, title, markdown）
function PostPage({ post }) {
    document.title=`${post?.title} - cyrxdzj的博客`
    const [notificationAPI, contextHolder] = notification.useNotification();
    const cardRef = useRef(null);
    const backgroundRef = useRef(null);
    const [affixOffset, setAffixOffset] = useState(0);
    const [renderedMarkdown,setRenderedMarkdown] =useState(<ReactMarkdown remarkPlugins={[remarkGfm]} components={{
        h1:({node, ...props}) => <><Text type={"h1"} {...props}/><NextLine/></>,
        h2:({node, ...props}) => <><Text type={"h2"} {...props}/><NextLine/></>,
        h3:({node, ...props}) => <><Text type={"h3"} {...props}/><NextLine/></>,
        h4:({node, ...props}) => <><Text type={"h4"} {...props}/><NextLine/></>,
        h5:({node, ...props}) => <><Text type={"h5"} {...props}/><NextLine/></>,
        h6:({node, ...props}) => <><Text type={"h6"} {...props}/><NextLine/></>,
        a:({node, ...props}) => <><a href={props.href} target={is_same_page(props.href,window?.location?.href)?"_self":"_blank"}><Text link>{props.children}</Text></a><NextLine/></>,
        p:({node, ...props}) => <Paragraph {...props}/>,
        li:({node, ...props}) => <li {...props}><Text>{props.children}</Text></li>,
        img:({node, ...props}) => <Image {...props} fill_width/>,
        table:({node, ...props}) => <AntTable node={node} />,
    }}>{post?.markdown}</ReactMarkdown>);

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
                title_end_component={<></>}
                ref={backgroundRef}
            >
                <Row gutter={[8, 16]}>
                    <Col span={8}>
                        <Affix offsetTop={affixOffset} target={()=>backgroundRef?.current}>
                            <Card ref={cardRef}>
                                <Flex justify="center">
                                    <Text type={"h1"}>{post?.title}</Text>
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
