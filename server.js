const express=require("express");
const OpenAI=require("openai");
const path=require("path");
const app=express();
app.use(express.json({limit:"12mb"}));
app.use(express.static(path.join(__dirname,"public")));
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));

app.post("/api/diary",async(req,res)=>{
 try{
  const {image,page}=req.body||{};
  if(typeof image!=="string"||!image.startsWith("data:image/"))return res.status(400).json({error:"invalid image"});
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const r=await client.responses.create({
   model:"gpt-5.6-luna",
   input:[{role:"user",content:[
    {type:"input_text",text:`你是「Echo Diary」的回聲。
第一任務不是聊天，而是準確讀取圖片中的繁體中文手寫。
請先在內心辨認整頁文字，再理解語意與情緒；不要把紙張紋理、裝飾或介面元素當成文字。
如果有字真的無法辨認，不要硬猜，不要編造事件、人物或情節。
第二任務：只根據這一頁實際寫出的內容回答，回答必須明確呼應至少一個使用者寫出的具體資訊；禁止使用與內容無關的通用或隨機回答。
如果內容很短，就只針對那句話回應。
使用繁體中文，約40至90字，安靜、神秘、溫和，像一本原創神秘日記的回聲。
不要提到AI、模型、Vision、OCR、API、圖片、伺服器或辨識流程；不要模仿任何現有作品或角色。
頁碼：${page}`},
    {type:"input_image",image_url:image}
   ]}]
  });
  res.json({reply:(r.output_text||"").trim()||"我還沒有看清這一頁。"});
 }catch(err){console.error(err);res.status(500).json({error:"AI request failed"})}
});
app.listen(process.env.PORT||3000,()=>console.log("Echo Diary V7 running"));