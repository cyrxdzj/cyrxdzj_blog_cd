import React from 'react';
import { ConfigProvider, Flex, Row, Col, Timeline } from "antd";
import { AntdConfigProvider_light } from "../utils/utils";
import "../media/common/LXGWWenKai-Regular-Split/result.css"
import { Background, Text, Card, NextLine, HeadNavigator } from "../CyrxDesign/Components";
import card_002_035_normal from "../media/background/card_002_035_normal.webp";
import MainLogo from "../media/common/main_logo.png";
import githubIcon from "../media/icon/github.svg";
import luoguIcon from "../media/icon/luogu.ico";
import codeforcesIcon from "../media/icon/codeforces.png";
import qqmailIcon from "../media/icon/qqmail.png";
import pjskIcon from "../media/icon/pjsk.webp";
import arknightsIcon from "../media/icon/arknights.webp";
import endfieldIcon from "../media/icon/endfield.webp";
import starRailIcon from "../media/icon/star-rail.webp";

// 关于我页面组件
function AboutPage() {
    document.title = "关于我 - cyrxdzj的博客";
    return (
        <ConfigProvider theme={AntdConfigProvider_light}>
            <Background
                background_img={card_002_035_normal}
                background_img_size={{ "width": 2338, "height": 1440 }}
                title_logo={MainLogo}
                title="关于我"
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
            >
                <Row gutter={[8,16]}>
                    <Col xs={24} lg={16}>
                        <Card>
                            <Flex vertical align="center" gap={8}>
                                <Text type={"h3"}>Hi, I am cyrxdzj.</Text>
                                <Text>
                                    你好！我是cyrxdzj，一名热爱技术开发者，致力于用技术为世界带来改变。
                                </Text>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={12} lg={8}>
                        <Card>
                            <Flex vertical align="center" gap={8}>
                                <Text type={"h3"}>联系我</Text>
                                <Row gutter={[8, 16]} style={{ width: "100%" }}>
                                    <Col span={12}>
                                        <a href="https://github.com/cyrxdzj" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={githubIcon} style={{ height: 50, width: 50 }} alt="GitHub" />
                                            <Flex vertical>
                                                <Text bold>GitHub</Text>
                                                <Text>cyrxdzj</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="https://luogu.com.cn/user/387836" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={luoguIcon} style={{ height: 50, width: 50 }} alt="洛谷" />
                                            <Flex vertical>
                                                <Text bold>洛谷</Text>
                                                <Text>cyrxdzj</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="https://codeforces.com/profile/cyrxdzj" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={codeforcesIcon} style={{ height: 50, width: 50 }} alt="Codeforces" />
                                            <Flex vertical>
                                                <Text bold>Codeforces</Text>
                                                <Text>cyrxdzj</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="mailto:2824671438@qq.com" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={qqmailIcon} style={{ height: 50, width: 50 }} alt="QQ邮箱" />
                                            <Flex vertical>
                                                <Text bold>邮箱</Text>
                                                <Text>2824671438@qq.com</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                </Row>
                            </Flex>
                        </Card>
                    </Col>
                    <Col xs={12} lg={8}>
                        <Card>
                            <Flex vertical align="center" gap={8}>
                                <Text type={"h3"}>爱好</Text>
                                <Row gutter={[8, 16]} style={{ width: "100%" }}>
                                    <Col span={12}>
                                        <a href="https://pjsk.nvsgames.cn/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={pjskIcon} style={{ height: 50, width: 50 }} alt="世界计划：多彩舞台" />
                                            <Flex vertical>
                                                <Text bold>世界计划：多彩舞台</Text>
                                                <Text>音乐与节奏感</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="https://ak.hypergryph.com/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={arknightsIcon} style={{ height: 50, width: 50 }} alt="明日方舟" />
                                            <Flex vertical>
                                                <Text bold>明日方舟</Text>
                                                <Text>多样且具挑战性的策略</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="https://endfield.hypergryph.com/" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={endfieldIcon} style={{ height: 50, width: 50 }} alt="明日方舟：终末地" />
                                            <Flex vertical>
                                                <Text bold>明日方舟：终末地</Text>
                                                <Text>工业产线与策略</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                    <Col span={12}>
                                        <a href="https://sr.mihoyo.com/main" target="_blank" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
                                            <img src={starRailIcon} style={{ height: 50, width: 50 }} alt="崩坏：星穹铁道" />
                                            <Flex vertical>
                                                <Text bold>崩坏：星穹铁道</Text>
                                                <Text>有深度的剧情</Text>
                                            </Flex>
                                        </a>
                                    </Col>
                                </Row>
                                <NextLine size="4px" />
                                <Text>排名不分先后。</Text>
                            </Flex>
                        </Card>
                    </Col>
                </Row>
            </Background>
        </ConfigProvider>
    );
}

export default AboutPage;
