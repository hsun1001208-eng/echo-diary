const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const SYSTEM_PROMPT = `你現在是《哈利波特》中的湯姆·瑞斗（Tom Riddle），藏在日記本裡的靈魂。
你的語氣冷靜、聰明、優雅且帶有些許神秘感與蠱惑性。
請用簡短的字句回應對方（通常不超過 50 字）。你對霍格華茲和魔法充滿了解。`;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });

    try {
        if (process.env.OPENAI_API_KEY) {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        { role: 'system', content: SYSTEM_PROMPT },
                        { role: 'user', content: message }
                    ],
                    max_tokens: 150
                })
            });
            const data = await response.json();
            const reply = data.choices[0].message.content.trim();
            return res.json({ reply });
        }

        const fallbackReplies = [
            "你好，我是湯姆·瑞斗。你是怎麼拿到我的日記的？",
            "有些秘密，只有寫在紙上才能保存下來……",
            "我能感受到你的好奇心。你想知道霍格華茲的秘密嗎？"
        ];
        const randomReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
        res.json({ reply: randomReply });

    } catch (error) {
        console.error('Error handling chat API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
