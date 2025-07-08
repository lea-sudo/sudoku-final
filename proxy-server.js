const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    if (!targetUrl) {
        return res.status(400).json({ success: false, error: '缺少url参数' });
    }
    try {
        const response = await fetch(targetUrl);
        if (!response.ok) {
            return res.status(500).json({ success: false, error: '目标网站响应失败: ' + response.status });
        }
        const content = await response.text();
        res.json({ success: true, content });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`代理服务器已启动，端口: ${PORT}`);
});