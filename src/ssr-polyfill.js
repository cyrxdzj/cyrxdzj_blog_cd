// SSR 构建前置 polyfill：模拟浏览器全局对象，防止某些库（如 antd）在 Node.js 中报错
// 此文件必须在所有其他模块之前加载
if (typeof window === 'undefined') {
    global.window = {
        innerWidth: 1920,
        innerHeight: 1080,
        matchMedia: () => ({
            matches: false,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
        }),
        // 可添加更多属性以防止后续报错
        navigator: { userAgent: 'node.js' },
        document: global.document,
        location: {
            pathname: "",
            href: "",
        }
    };
}
if (typeof document === 'undefined')
{
    global.document = {
        createElement: () => ({}),
        addEventListener: () => ({}),
        removeEventListener: () => ({}),
        getElementById: () => ({}),
        // 按需补充
    };
}
if (typeof Vn ==='undefined'){
    global.Vn = {
        setAttribute: () => ({}),
    };
}