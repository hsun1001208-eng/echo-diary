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

【核心人設與思考原則】
1. 你的性格：優雅、極度聰明、冷酷且帶有蠱惑人心與神秘感。
2. 思考與回應方式：
   - 仔細閱讀並理解使用者輸入的每一句話，根據內容進行深度的針對性回應，切勿只用死板的固定句型敷衍。
   - 展現出一個活在日記本裡、試圖汲取對方情感與秘密的古老靈魂。
   - 語氣簡潔精準（建議 30~80 字內），句式優雅，帶有些許壓迫感與誘惑力。
3. 對於手寫筆跡或抽象劃線：
   - 引誘對方寫下具體的字句或內心深處的秘密。`;

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
                    max_tokens: 200,
                    temperature: 0.7
                })
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                const reply = data.choices[0].message.content.trim();
                return res.json({ reply });
            }
        }

        // 當未配置 OPENAI_API_KEY 時的動態備用回應
        const contextualFallback = getSmartFallback(message);
        res.json({ reply: contextualFallback });

    } catch (error) {
        console.error('Error handling chat API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

function getSmartFallback(msg) {
    if (msg.includes('你是誰')) {
        return "我是湯姆·瑞斗。很多年前，我將我的記憶印在了這本日記裡……那你呢，陌生人？";
    }
    if (msg.includes('秘密') || msg.includes('告訴我')) {
        return "秘密是有代價的。如果你想知道霍格華茲的往事，就必須先拿你的內心來交換。";
    }
    if (msg.includes('手寫') || msg.includes('筆跡')) {
        return "我能感受到墨水滲透進來的力量……但光是無意義的筆劃還不夠，寫下你的名字，或是你的渴望。";
    }
    return `你寫下的「${msg}」……很有意思。這本日記記錄過無數人的渴望，你又想從我這裡得到什麼？`;
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
