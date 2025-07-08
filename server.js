const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());

// 静态文件服务
app.use(express.static('.'));

// 代理路由 - 获取外部网页内容
app.get('/proxy', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) {
            return res.status(400).json({ error: '缺少URL参数' });
        }

        console.log('代理请求:', url);

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });

        res.json({
            success: true,
            content: response.data,
            url: url
        });

    } catch (error) {
        console.error('代理请求失败:', error.message);
        res.status(500).json({
            error: '代理请求失败',
            message: error.message
        });
    }
});

// 测试路由
app.get('/test', (req, res) => {
    res.json({ message: '代理服务器运行正常' });
});

app.listen(PORT, () => {
    console.log(`代理服务器运行在 http://localhost:${PORT}`);
    console.log(`测试: http://localhost:${PORT}/test`);
    console.log(`代理: http://localhost:${PORT}/proxy?url=<目标URL>`);
}); 