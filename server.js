const express=require("express"),OpenAI=require("openai"),path=require("path");
const app=express();app.use(express.json({limit:"12mb"}));app.use(express.static(__dirname));
app.get("/",(q,s)=>s.sendFile(path.join(__dirname,"index.html")));
function parse(s){s=String(s||"").replace(/^```json\s*/i,"").replace(/```$/,"").trim();try{return JSON.parse(s)}catch(_){let a=s.indexOf("{"),b=s.lastIndexOf("}");if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));throw Error("bad model output")}}
app.post("/api/diary",async(q,s)=>{try{if(!process.env.OPENAI_API_KEY)return s.status(500).json({error:"OPENAI_API_KEY is not configured"});let image=q.body?.image;if(typeof image!=="string"||!image.startsWith("data:image/"))return s.status(400).json({error:"invalid image"});
let ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});let r=await ai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content:[
{type:"input_text",text:`你是 Echo Diary 的手寫辨識者。只看使用者自己寫的手寫筆跡，忽略所有介面文字。先辨識再回答，不要猜測看不清的字。
只輸出JSON：{"transcription":"手寫原文","reply":"回覆"}
規則：transcription只能填真正看見的手寫內容；如果看不清楚就填空。若手寫是1024（可有空白），reply必須是「生日快樂！」。一般回覆必須直接回應手寫內容，至少提到一個具體細節；例如手寫「你好」就回應打招呼，不能談不存在的下雨。不要自行增加情節。繁體中文。不要提及AI、OCR、API、圖片或伺服器。`},
{type:"input_image",image_url:image}]}]});let d=parse(r.output_text),t=String(d.transcription||"").trim(),n=t.replace(/[\\s　]/g,""),birthday=/^1024$/.test(n);s.json({transcription:t,reply:birthday?"生日快樂！":String(d.reply||"我沒有聽清楚這一筆，再寫一次吧。"),birthday})}catch(e){console.error(e);s.status(500).json({error:"AI request failed"})}});
let port=process.env.PORT||3000;app.listen(port,()=>console.log("Echo Diary V10 on "+port));