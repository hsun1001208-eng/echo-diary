

app.get("/health",(req,res)=>{
  res.json({status:"ok",version:"V16"});
});
const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use(express.static(__dirname));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

app.post("/api/diary", async (req, res) => {
  try {
    const { image, page } = req.body || {};
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return res.status(400).json({ error: "invalid image" });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Pass 1: transcription only. This prevents the model from inventing a diary reply
    // before it has established what is actually written.
    const transcription = await client.responses.create({
      model: "gpt-5.6",
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `這是一張「Echo Diary」使用者手寫內容的近距離圖片。
請只做「繁體中文手寫文字轉錄」，不要聊天、不要創作、不要猜測故事。
規則：
1. 只讀圖片中深色手寫筆畫，不要把紙張、按鈕、PAGE、標題或其他介面文字當成使用者內容。
2. 由左到右、由上到下轉錄。
3. 看不清楚的字請用「□」表示，絕對不要自行補成另一個句子。
4. 如果只有一個很短的詞或問候語，就只輸出那個詞。
5. 只輸出轉錄文字本身，不要加引號、解釋或標點說明。
6. 這次頁碼是 ${page}。`
          },
          { type: "input_image", image_url: image }
        ]
      }]
    });

    const transcript = (transcription.output_text || "").trim();
    if (!transcript || transcript === "□") {
      return res.json({ reply: "我還沒有看清這一頁，請再寫得清楚一些。" });
    }

    // Pass 2: answer strictly from the transcript. The transcript is also shown in the
    // model prompt so the reply cannot casually switch to an unrelated imagined topic.
    if (/(^|\D)1024(\D|$)/.test(transcript)) {
      return res.json({
        reply:"生日快樂。願今天的願望被好好收藏，也願下一頁仍有值得期待的故事。",
        special:"birthday"
      });
    }

    const answer = await client.responses.create({
      model: "gpt-5.6",
      input: [{
        role: "user",
        content: [{
          type: "input_text",
          text: `你是「Echo Diary」的回聲。
使用者剛剛真正寫下的內容，經過逐字轉錄後是：
【${transcript}】

請只根據上面這段內容回應。
- 回覆必須明確提到或回應其中至少一個實際詞語、事情或意思。
- 絕對不要加入轉錄內容沒有出現的天氣、人物、事件、地點或故事。
- 如果內容只是「你好」這類簡短問候，就直接回應問候，不要自行延伸成別的事件。
- 如果轉錄含有「□」，不要猜測□代表什麼。
- 使用繁體中文，約 20–60 字，安靜、神秘、溫和，像一本原創神秘日記的回聲。
- 不要提到 AI、模型、OCR、API、圖片、伺服器或轉錄。
- 不要模仿任何現有作品或角色。
只輸出回覆文字。`
        }]
      }]
    });

    res.json({ reply: (answer.output_text || "").trim() || "我聽見了你的字。" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

app.listen(process.env.PORT || 3000, () => console.log("Echo Diary V8 running"));
