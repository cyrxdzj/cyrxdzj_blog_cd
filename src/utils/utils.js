import { useState, useEffect } from 'react';
import { theme } from 'antd';
export function convertFileSize(file_size) {
    let unit = ["B", "KB", "MB", "GB", "TB", "PB"];
    for (var i = 0; i < unit.length; i++) {
        if (file_size < 1024 * 0.9 || i == unit.length - 1) {
            return ((Math.round(file_size * 100) / 100.0).toString() + unit[i]);
        }
        file_size /= 1024.0;
    }
}

class DebugInfo {
    constructor(){
        this.debugPage=false;
        [this.debugMode,this.setDebugMode]=[undefined,undefined];
    }
}
export const useDebugInfo = () => {
    let debug_info=new DebugInfo();
    try
    {
        if(window.location.host=="localhost:3000")
        {
            debug_info.debugPage=true;
        }
    }
    catch(e)
    {
        console.log(e);
    }
    [debug_info.debugMode,debug_info.setDebugMode]=useState(false);
    const handleKeyDown=(e)=>{
        console.log(e);
    }
    /*useEffect(()=>{
        if(debug_info.debugPage)
        {
            document.addEventListener("keypress",handleKeyDown);
        }
        return ()=>{
            if(debug_info.debugPage)
            {
                document.removeEventListener("keypress",handleKeyDown);
            }
        };
    },[]);*/
    return debug_info;
}

export const useWindowSize = () => {
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
const defaultFontFamily=" -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";
export const AntdConfigProvider_light = {
    "token": {
        "colorPrimary": "#000088",
        "colorInfo": "#000088",
        "colorSuccess": "#00aa00",
        "colorWarning": "#ff8800",
        "colorError": "#cc0000",
        "borderRadius": 10,
        "colorBgContainer": "rgba(255,255,255,0.4)",
        "colorBgBase": "rgba(255,255,255,0.6)",
        "dark":false,
        "fontFamily":`"LXGW Wenkai",${defaultFontFamily}`,
    }
}
export const AntdConfigProvider_dark = {
    "token": {
        "colorPrimary": "#000088",
        "colorInfo": "#000088",
        "colorSuccess": "#00aa00",
        "colorWarning": "#ff8800",
        "colorError": "#cc0000",
        "borderRadius": 10,
        "colorBgContainer": "rgba(0,0,0,0.4)",
        "colorBgBase": "rgba(0,0,0,0.6)",
        "dark":true,
        "fontFamily":`"LXGW Wenkai",${defaultFontFamily}`,
    },
    "algorithm": theme.darkAlgorithm,
}
const hash_salt="salt.cyrxdzj.io";
export function getSaltPassword(data,hash_salt=hash_salt)
{
    const hash_obj=CryptoJS.HmacSHA512(data+"?"+hash_salt,hash_salt);
    return CryptoJS.enc.Hex.stringify(hash_obj);
}
export function pad(num,padlen=2) {
  return num.toString().padStart(padlen, "0");
}
// rgb to hex
function rgbToHex(r, g, b) {
    var hex = ((r << 16) | (g << 8) | b).toString(16);
    return "#" + new Array(Math.abs(hex.length - 7)).join("0") + hex;
}

// hex to rgb
function hexToRgb(hex) {
    var rgb = [];
    for (var i = 1; i < 7; i += 2) {
        rgb.push(parseInt("0x" + hex.slice(i, i + 2)));
    }
    return rgb;
}

// 计算渐变过渡色
export function gradient(startColor, endColor, percent) {
    // 将 hex 转换为rgb
    var sColor = hexToRgb(startColor),
        eColor = hexToRgb(endColor);

    // 计算R\G\B每一步的差值
    var rStep = (eColor[0] - sColor[0]) / 100,
        gStep = (eColor[1] - sColor[1]) / 100,
        bStep = (eColor[2] - sColor[2]) / 100;

    return rgbToHex(parseInt(rStep * percent + sColor[0]), parseInt(gStep * percent + sColor[1]), parseInt(bStep * percent + sColor[2]));
}

// 将传入的时间戳转为year-month-day hour:minute:second形式
export function formatTimestamp(timestamp, format = "year-month-day hour:minute:second") {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    return format
        .replace("year", year)
        .replace("month", month)
        .replace("day", day)
        .replace("hour", hours)
        .replace("minute", minutes)
        .replace("second", seconds);
}