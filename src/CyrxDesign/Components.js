import React from 'react';
import { theme,Flex, Row, Col } from "antd";
import { forwardRef,useState,useEffect } from "react";
import "./Components.css"

const text_size = {
    "normal": "16px","h5":"16px", "h4": "20px", "h3": "24px", "h2": "32px", "h1": "40px"
};
const useWindowSize = () => {
    // 第一步：声明能够体现视口大小变化的状态
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // 第二步：通过生命周期 Hook 声明回调的绑定和解绑逻辑
    useEffect(() => {
        const updateSize = () => setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    return windowSize;
}
export function Background(props) {
    let background_img_left=0,background_img_top=0;
    let background_img_render_width=0,background_img_render_height=0;
    const windowSize=useWindowSize();
    if(props.background_img!=undefined)
    {
        let zoom=Math.max(  windowSize.width /props.background_img_size.width ,
                            windowSize.height/props.background_img_size.height,
        );
        background_img_render_width =props.background_img_size.width *zoom;
        background_img_render_height=props.background_img_size.height*zoom;
        background_img_left=(windowSize.width -background_img_render_width )/2;
        background_img_top =(windowSize.height-background_img_render_height)/2;
    }
    return (
        <>
        <div style={{"position": "fixed",
                "width": background_img_render_width,"height":background_img_render_height,
                "left":background_img_left,"top":background_img_top,"z-index": "-1"}}>
            <img src={props.background_img} style={{"object-fit": "cover","width": "100%"}}/>
        </div>
        <div style={Object.assign({
            "background": props.background,
        },props.custom_style)} className={(props.title!=undefined)?"Background BackgroundNoTopPadding":"Background"}>
            {(props.title!=undefined)?(
                <>
                <Card titleCard>
                    {/*<Flex align="center" justify="space-between">
                        {props.title_logo && <a href="/"><Image src={props.title_logo} height={"50px"}></Image></a>}
                        <Text>{props.title}</Text>
                        {props.title_logo && <Image src={props.title_logo} height={"50px"} style={{"opacity":"0"}}></Image>}
                    </Flex>*/}
                    <Row justify={"center"} align={"middle"}>
                        <Col span={8}>
                            <Flex justify={"start"}>
                                {props.title_logo && <a href="/"><Image src={props.title_logo} height={"50px"}></Image></a>}
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex justify={"center"}>
                                <Text>{props.title}</Text>
                            </Flex>
                        </Col>
                        <Col span={8}>
                            <Flex justify={"center"}>
                                {props.title_end_component}
                            </Flex>
                        </Col>
                    </Row>
                </Card>
                <NextLine />
                </>
                ):(<></>)}
            {props.children}
        </div></>);
}

export function Card(props) {
    //console.log(theme.useToken());
    return (<div style={Object.assign({"background":theme.useToken().token.colorBgBase},props.custom_style)} {...props}
            className={"Card"+(props.titleCard?" CardTitle":"")}>
                {props.children}
            </div>);
}

export const Text=forwardRef((props,ref)=>{
    //console.log(props);
    var color=theme.useToken().token.colorText;
    if(props.inPrimary){
        color=theme.useToken().token.primaryColor;
    }
    return (<span style={Object.assign({
        "fontSize": text_size[props.type ? props.type : "normal"],
        "fontWeight": ((props.type !== undefined && props.type.startsWith("h")) || props.bold) ? "bold" : "normal",
        "color": color
    },props.custom_style)} {...props} className={"Text"} ref={ref}>{props.children}</span>);
});

export function Paragraph(props) {
    return (<pre style={Object.assign({
        "fontSize": text_size[props.type ? props.type : "normal"],
        "fontWeight": ((props.type !== undefined && props.type.startsWith("h")) || props.bold) ? "bold" : "normal",
        "color": theme.useToken().token.colorText
    },props.custom_style)} {...props} className={"Text"}>{props.children}</pre>);
}

export function NextLine({size = "15px"}) {
    return (<div style={{"display": "block", "height": size}}/>);
}

export function Image(props) {
    var description_element = <></>;
    if (props.description) {
        description_element = <>
            <NextLine/>
            <Text>{props.description}</Text>
        </>;
    }
    return (
        <div style={Object.assign({}, props.custom_style)}><img style={{"height":props.height}}
               alt={""} {...props}/>{description_element}</div>
    );
}