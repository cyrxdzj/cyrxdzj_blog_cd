import React from 'react';
import { Col, ConfigProvider, Flex, notification, Row } from "antd";
import { AntdConfigProvider_light } from "../utils/utils";
import { Background, Text, Card } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";

function IndexPage(props) {
    document.title="cyrxdzj的博客";
    const [notificationAPI, contextHolder] = notification.useNotification();
    console.log(props.index_yaml);
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
                </Row>
            </Background>
        </ConfigProvider>
    );
}

export default IndexPage;
