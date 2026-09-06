const express = require("express");
const OpenAI = require("openai");
const path = require("path");

const app = express();
app.use(express.json({ limit: "12mb" }));
app.use(express.static(__dirname));

app.get("/", (req,res)=>res.sendFile(path.join(__dirname,"index.html")));

app.post("/api/diary", async (req,res)=>{
  try{
    const { image } = req.body || {};
    if(!image || !image.startsWith("data:image/")) return res.status(400).json({error:"invalid image"});
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await client.responses.create({
      model: "gpt-5.6-luna",
      input: [{
        role: "user",
        content: [
          {type:"input_text", text:
`你是 Echo Diary 的手寫辨識與回覆者。
請只處理這張圖片中的「使用者手寫筆跡」，忽略紙張、按鈕、裝飾和介面文字。

第一步：仔細辨識手寫內容，尤其是數字。不要因為看不清楚就自行補成常見句子。
第二步：根據你真正辨識到的內容產生回覆。

請嚴格輸出 JSON，不要輸出 Markdown：
{"transcription":"你辨識到的手寫原文","reply":"給使用者的回覆","birthday":true或false}

規則：
- transcription 只能填你確定看見的手寫內容；看不清楚時填空字串。
- 如果 transcription 完全是「1024」（允許前後空白），reply 必須是「生日快樂！」，birthday 必須是 true。
- 如果手寫內容不是 1024，birthday 必須是 false。
- 一般 reply 必須明確提到手寫內容中的至少一個具體細節。
- 如果辨識不清楚，reply 請簡短說「我沒有聽清楚這一筆，再寫一次吧。」不要猜。
- 使用繁體中文，40～90字；「1024」的生日回覆除外。
- 不要提到 AI、模型、OCR、API、圖片或辨識技術。
- 不要模仿任何既有作品或角色。`
          },
          {type:"input_image", image_url:image}
        ]
      }]
    });

    const raw = response.output_text || "";
    let data;
    try { data = JSON.parse(raw); }
    catch {
      const m = raw.match(/\{[\s\S]*\}/);
      if(!m) throw new Error("invalid model output");
      data = JSON.parse(m[0]);
    }

    const transcription = String(data.transcription || "").trim();
    const birthday = transcription === "1024";
    const reply = birthday ? "生日快樂！" : String(data.reply || "我沒有聽清楚這一筆，再寫一次吧。");
    res.json({ transcription, reply, birthday });
  }catch(err){
    console.error(err);
    res.status(500).json({error:"diary request failed"});
  }
});

const port = process.env.PORT || 3000;
app.listen(port,()=>console.log(`Echo Diary V9 listening on ${port}`));
