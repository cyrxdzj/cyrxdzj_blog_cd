import React, { useEffect, useRef, useState } from 'react';
import { Affix, Col, ConfigProvider, Flex, notification, Row } from "antd";
import { AntdConfigProvider_light } from "../utils/utils";
import { Background, Text, Card, Paragraph } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

// 博文详情页组件，接收 post 对象（含 id, title, markdown）
function PostPage({ post }) {
    document.title=`${post?.title} - cyrxdzj的博客`
    const [notificationAPI, contextHolder] = notification.useNotification();
    const cardRef = useRef(null);
    const [affixOffset, setAffixOffset] = useState(80);

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
            >
                <Row gutter={[8, 16]}>
                    <Col span={8}>
                        <Affix offsetTop={affixOffset}>
                            <Card ref={cardRef}>
                                <Flex justify="center">
                                    <Text type={"h1"}>{post?.title}</Text>
                                </Flex>
                            </Card>
                        </Affix>
                    </Col>
                    <Col span={16}>
                        <Paragraph>
                            {"abcd\n".repeat(100)}
                        </Paragraph>
                    </Col>
                </Row>
            </Background>
        </ConfigProvider>
    );
}

export default PostPage;
