const express=require("express");
const OpenAI=require("openai");
const path=require("path");

const app=express();
app.use(express.json({limit:"15mb"}));
app.use(express.static(__dirname));
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));

function parseJSON(raw){
  let s=String(raw||"").trim().replace(/^```(?:json)?\s*/i,"").replace(/\s*```$/,"");
  try{return JSON.parse(s)}catch(_){}
  const a=s.indexOf("{"),b=s.lastIndexOf("}");
  if(a>=0&&b>a)return JSON.parse(s.slice(a,b+1));
  throw new Error("AI did not return JSON");
}

app.post("/api/diary",async(req,res)=>{
 try{
  const image=req.body?.image;
  if(typeof image!=="string"||!image.startsWith("data:image/"))return res.status(400).json({error:"收到的手寫圖片無效"});
  if(!process.env.OPENAI_API_KEY)return res.status(500).json({error:"Render 尚未設定 OPENAI_API_KEY"});

  const ai=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const r=await ai.responses.create({
   model:"gpt-5.6-luna",
   input:[{role:"user",content:[
    {type:"input_text",text:`你現在只做一件事：讀取圖片中使用者的手寫字，再依照讀到的字回答。
忽略所有網頁介面、標題、按鈕、紙張與裝飾。
請先辨識，再回答；不要用常見句子填補看不清楚的字。
只輸出JSON，不要Markdown：
{"transcription":"手寫原文","reply":"回覆"}

重要規則：
- transcription 必須是圖片裡真正看到的手寫內容。
- 若手寫是 1024（可有空白），transcription 填 1024，reply 必須是「生日快樂！」。
- 若手寫是「你好」，reply 必須是在回應打招呼，不能提到下雨。
- 一般回覆必須根據 transcription，不得自行創造不存在的事情。
- 看不清楚時 transcription 填空字串，reply 填「我沒有聽清楚這一筆，再寫一次吧。」
- 使用繁體中文。
- 不要提及 AI、OCR、模型、API、圖片或伺服器。`},
    {type:"input_image",image_url:image}
   ]}]
  });

  const d=parseJSON(r.output_text);
  const transcription=String(d.transcription||"").trim();
  const normalized=transcription.replace(/\s+/g,"");
  const birthday=normalized==="1024";
  const reply=birthday?"生日快樂！":String(d.reply||"我沒有聽清楚這一筆，再寫一次吧。").trim();
  res.json({transcription,reply,birthday});
 }catch(err){
  console.error("Echo Diary V11:",err);
  res.status(500).json({error:`AI 回應失敗：${err.message||"未知錯誤"}`});
 }
});

const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`Echo Diary V11 listening on ${port}`));
