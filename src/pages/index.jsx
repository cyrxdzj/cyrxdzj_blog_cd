import React, { useState } from 'react';
import { Col, ConfigProvider, Flex, notification, Pagination, Row } from "antd";
import { AntdConfigProvider_light } from "../utils/utils";
import { Background, Text, Card, NextLine } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

function IndexPage(props) {
    document.title="cyrxdzj的博客";
    const [notificationAPI, contextHolder] = notification.useNotification();
    console.log(props.index_yaml);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const startIndex = (currentPage - 1) * pageSize;
    const currentPosts = props.index_yaml.posts.slice(startIndex, startIndex + pageSize);
    return (
        <ConfigProvider theme={AntdConfigProvider_light}>
            {contextHolder}
            <Background
                background_img={card_002_035_normal}
                background_img_size={{ "width": 2338, "height": 1440 }}
                title_logo={MainLogo}
                title="cyrxdzj的博客"
                title_end_component={<></>}
            >
                <Row gutter={[8, 16]}>
                    <Col span={8}>
                        <Card>
                            <Flex justify="center">
                                <Text type={"h1"}>I am cyrxdzj.</Text>
                            </Flex>
                            <Row gutter={[8, 16]}>
                                <Col span={8}><Text>Luogu</Text></Col>
                                <Col span={16}><a href="https://luogu.com.cn/user/387836"><Text>https://luogu.com.cn/user/387836</Text></a></Col>
                            </Row>
                        </Card>
                    </Col>
                    <Col span={16}>
                        <Flex vertical gap={8}>
                            {currentPosts.map(post => (
                                <a href={`/post/${post.id}`} target='_blank'>
                                    <Card key={post.id}>
                                        <Text type={"h3"}>{post.title}</Text>
                                        <NextLine/>
                                        <Text>{post.summary}</Text>
                                    </Card>
                                </a>
                            ))}
                            <Flex justify="center">
                                <Pagination
                                    current={currentPage}
                                    total={props.index_yaml.posts.length}
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
