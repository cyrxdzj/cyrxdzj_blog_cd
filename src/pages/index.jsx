import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Affix, Col, ConfigProvider, Flex, notification, Pagination, Row, Tag, theme, Button, Tooltip, Select } from "antd";
import { DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { AntdConfigProvider_light, formatTimestamp } from "../utils/utils";
import "../media/common/LXGWWenKai-Regular-Split/result.css"
import { Background, Text, Card, NextLine, HeadNavigator } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

function IndexPage(props) {
    document.title="cyrxdzj的博客";
    const [notificationAPI, contextHolder] = notification.useNotification();
    const { token } = theme.useToken();
    const cardRef = useRef(null);
    const backgroundRef = useRef(null);
    const [affixOffset, setAffixOffset] = useState(0);
    // 从 URL search 参数读取初始状态
    const getInitialConfig = () => {
        const params = new URLSearchParams(window.location.search);
        const field = params.get('sort') || 'default';
        const order = params.get('order') || 'desc';
        const tagsParam = params.get('tags');
        const tags = tagsParam ? tagsParam.split(',').filter(t => t) : [];
        return { field, order, tags };
    };

    const [selectedTags, setSelectedTags] = useState(getInitialConfig().tags);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState(getInitialConfig().field);
    const [sortOrder, setSortOrder] = useState(getInitialConfig().order);
    const pageSize = 10;

    // 同步 state 到 URL search 参数
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (sortField && sortField !== 'default') {
            params.set('sort', sortField);
        } else {
            params.delete('sort');
        }
        if (sortOrder && sortOrder !== 'desc') {
            params.set('order', sortOrder);
        } else {
            params.delete('order');
        }
        if (selectedTags.length > 0) {
            params.set('tags', selectedTags.join(','));
        } else {
            params.delete('tags');
        }
        const newSearch = params.toString();
        const newURL = window.location.pathname + (newSearch ? '?' + newSearch : '');
        window.history.replaceState(null, '', newURL);
    }, [sortField, sortOrder, selectedTags]);

    // 排序和筛选后的文章列表
    const filteredPosts = useMemo(() => {
        // 筛选
        let result = (selectedTags.length === 0
            ? props.index_yaml.posts
            : props.index_yaml.posts.filter(post =>
                selectedTags.every(tagId => post.tags && post.tags.includes(tagId))
                )
        );

        // 排序
        result = result.slice().sort((a, b) => {
            let aVal, bVal;
            if (sortField === 'editTime') {
                aVal = a.editTimeStr ? new Date(a.editTimeStr).getTime() : 0;
                bVal = b.editTimeStr ? new Date(b.editTimeStr).getTime() : 0;
            } else {
                // 默认排序：使用 posts 数组中的原始顺序
                aVal = props.index_yaml.posts.indexOf(a);
                bVal = props.index_yaml.posts.indexOf(b);
            }
            if (sortOrder === 'asc') return aVal - bVal;
            else return bVal - aVal;
        });

        return result;
    }, [selectedTags, sortField, sortOrder, props.index_yaml.posts]);

    const startIndex = (currentPage - 1) * pageSize;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

    // 点击文章列表中的 tag：清空现有选择，仅选中该 tag
    const handleTagFromPostClick = (tagId, e) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setSelectedTags([tagId]);
        setCurrentPage(1);
    };

    const handleTagClick = (tagId) => {
        setSelectedTags(prev =>
            prev.includes(tagId)
                ? prev.filter(t => t !== tagId)
                : [...prev, tagId]
        );
        setCurrentPage(1);
    };

    // 排序方式变更处理
    const handleSortFieldChange = (value) => {
        setSortField(value);
        setCurrentPage(1);
    };

    const handleSortOrderChange = (value) => {
        setSortOrder(value);
        setCurrentPage(1);
    };

    useEffect(() => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            setAffixOffset(rect.top);
        }
    }, []);

    // 供 Select 使用的排序选项
    const sortFieldOptions = [
        { value: 'default', label: <Text>默认排序</Text> },
        { value: 'editTime', label: <Text>提交时间</Text> },
    ];
    const sortOrderOptions = [
        { value: 'desc', label: <><ArrowDownOutlined /><Text> 降序</Text></> },
        { value: 'asc', label: <><ArrowUpOutlined /><Text> 升序</Text></> },
    ];
    return (
        <ConfigProvider theme={AntdConfigProvider_light}>
            {contextHolder}
            <Background
                background_img={card_002_035_normal}
                background_img_size={{ "width": 2338, "height": 1440 }}
                title_logo={MainLogo}
                title="cyrxdzj的博客"
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
                                    <Text type={"h1"}>I am cyrxdzj.</Text>
                                </Flex>
                                <Row gutter={[8, 16]}>
                                    <Col span={8}><Text>洛谷</Text></Col>
                                    <Col span={16}><a href="https://luogu.com.cn/user/387836"><Text link>cyrxdzj</Text></a></Col>
                                </Row>
                                <Row gutter={[8, 16]}>
                                    <Col span={8}><Text>oiClass</Text></Col>
                                    <Col span={16}><a href="https://oiclass.com/user/10161"><Text link>cyrxdzj</Text></a></Col>
                                </Row>
                            </Card>
                            <NextLine/>
                            <Card>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Flex align="center" gap={8}>
                                            <Text type={"h3"}>标签筛选</Text>
                                            {selectedTags.length > 0 && (
                                                <Tooltip title={<Text inPrimary>清空标签筛选</Text>}>
                                                    <Button
                                                        shape="circle"
                                                        icon={<DeleteOutlined />}
                                                        size="small"
                                                        onClick={() => {
                                                            setSelectedTags([]);
                                                            setCurrentPage(1);
                                                        }}
                                                    />
                                                </Tooltip>
                                            )}
                                        </Flex>
                                        <NextLine/>
                                        <Flex wrap gap={8}>
                                            {Object.entries(props.index_yaml.tags).map(([tagId, tagData]) => (
                                                <Tag
                                                    key={tagId}
                                                    color={AntdConfigProvider_light.token.colorPrimary}
                                                    variant={selectedTags.includes(tagId) ?"solid":"filled"}
                                                    onClick={() => handleTagClick(tagId)}
                                                >
                                                    {tagData.name}
                                                </Tag>
                                            ))}
                                        </Flex>
                                    </Col>
                                    <Col span={12}>
                                        <Flex align="center" gap={8}>
                                            <Text type={"h3"}>文章排序</Text>
                                        </Flex>
                                        <NextLine/>
                                        <Flex gap={8} align="center" wrap>
                                            <Select
                                                size="small"
                                                value={sortField}
                                                onChange={handleSortFieldChange}
                                                options={sortFieldOptions}
                                                style={{ width: 120 }}
                                            />
                                            <Select
                                                size="small"
                                                value={sortOrder}
                                                onChange={handleSortOrderChange}
                                                options={sortOrderOptions}
                                                style={{ width: 100 }}
                                            />
                                        </Flex>
                                    </Col>
                                </Row>
                            </Card>
                        </Affix>
                    </Col>
                    <Col span={16}>
                        <Flex vertical gap={8}>
                            {currentPosts.map(post => (
                                <a href={`/post/${post.id}`} target='_blank'>
                                    <Card key={post.id}>
                                        <Flex justify="space-between" align="flex-start">
                                            <Flex vertical flex={1}>
                                                <Text type={"h3"}>{post.title}</Text>
                                                <Text>{post.summary}</Text>
                                            </Flex>
                                            <Flex vertical align="flex-end" style={{ whiteSpace: "nowrap" }}>
                                                <Text>{post?.editTimeStr ? formatTimestamp(new Date(post.editTimeStr).getTime()) : ''}</Text>
                                                <Text>{post.length} 字</Text>
                                                {post.tags && post.tags.length > 0 && (
                                                    <Flex gap={8} wrap style={{ justifyContent: "flex-end", marginTop: 8 }}>
                                                        {post.tags.map(tagId => (
                                                            <Tag
                                                                key={tagId}
                                                                color={AntdConfigProvider_light.token.colorPrimary}
                                                                variant="solid"
                                                                onClick={(e) => handleTagFromPostClick(tagId, e)}
                                                                style={{ cursor: "pointer" }}
                                                            >{props.index_yaml.tags[tagId].name}</Tag>
                                                        ))}
                                                    </Flex>
                                                )}
                                            </Flex>
                                        </Flex>
                                    </Card>
                                </a>
                            ))}
                            <Flex justify="center">
                                <Pagination
                                    current={currentPage}
                                    total={filteredPosts.length}
                                    pageSize={pageSize}
                                    onChange={(page) => setCurrentPage(page)}
                                />
                            </Flex>
                        </Flex>
                    </Col>
                </Row>
            </Background>
        </ConfigProvider>
    );
}

export default IndexPage;
