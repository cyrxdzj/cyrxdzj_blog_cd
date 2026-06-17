import React, { useState } from 'react';
import { Col, ConfigProvider, Flex, notification, Pagination, Row, Tag, theme, Button, Tooltip } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { AntdConfigProvider_light, formatTimestamp } from "../utils/utils";
import { Background, Text, Card, NextLine, HeadNavigator } from "../CyrxDesign/Components";
import "../media/common/LXGWWenKai-Regular-Split/result.css"
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

function IndexPage(props) {
    document.title="cyrxdzj的博客";
    const [notificationAPI, contextHolder] = notification.useNotification();
    const { token } = theme.useToken();
    const [selectedTags, setSelectedTags] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    // 筛选：如果 selectedTags 为空则显示所有，否则只保留包含所有选中标签的文章
    const filteredPosts = selectedTags.length === 0
        ? props.index_yaml.posts
        : props.index_yaml.posts.filter(post =>
            selectedTags.every(tagId => post.tags && post.tags.includes(tagId))
          );
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
            >
                <Row gutter={[8, 16]}>
                    <Col span={8}>
                        <Card>
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
                            <Flex align="center" gap={8}>
                                <Text type={"h3"}>标签</Text>
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
                                        color={selectedTags.includes(tagId) ? token.colorPrimary : token.colorPrimary}
                                        variant={selectedTags.includes(tagId) ?"solid":"filled"}
                                        onClick={() => handleTagClick(tagId)}
                                    >
                                        {tagData.name}
                                    </Tag>
                                ))}
                            </Flex>
                        </Card>
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
                                                <Text>{formatTimestamp(post.editTimeStr)}</Text>
                                                <Text>{post.length} 字</Text>
                                                {post.tags && post.tags.length > 0 && (
                                                    <Flex gap={8} wrap style={{ justifyContent: "flex-end", marginTop: 8 }}>
                                                        {post.tags.map(tagId => (
                                                            <Tag
                                                                key={tagId}
                                                                color={token.colorPrimary}
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
