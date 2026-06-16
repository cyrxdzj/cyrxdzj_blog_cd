import { fetch as undiciFetch, Agent } from 'undici';
import https from 'https';
import fs from 'fs';

export default function(){
    const caCert = fs.readFileSync("D:/dengzijun/certs/SSL Certificate Self/ca.crt");
    const originalCreateConnection = https.Agent.prototype.createConnection;

    const agent = new Agent({
        connect: {
            ca: caCert,  // 额外信任的 CA
        },
    });

    // 替换全局 fetch
    globalThis.fetch = (url, options = {}) => {
        // 合并 agent，但不影响已有的其他选项
        return undiciFetch(url, { ...options, dispatcher: agent });
    };
}