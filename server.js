const express=require("express");
const OpenAI=require("openai");
const app=express();
app.use(express.json({limit:"12mb"}));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/api/diary",async(req,res)=>{
  try{
    const {image,page}=req.body||{};
    if(typeof image!=="string"||!image.startsWith("data:image/")) return res.status(400).json({error:"invalid image"});
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const r=await client.responses.create({
      model:"gpt-5.6-luna",
      input:[{
        role:"user",
        content:[
          {type:"input_text",text:
`你正在回應一本神秘但溫和的原創日記。
請仔細閱讀圖片中的繁體中文手寫內容，理解它真正寫了什麼，再根據內容與情緒回答。
若某些字無法辨認，不要硬猜。
只回答與這一頁內容有關的話題，不要使用固定或隨機通用回答。
使用繁體中文，約40至90字；語氣安靜、神秘、像日記中的回聲，但不要模仿任何現有作品或角色，也不要提到AI、模型、OCR、API或伺服器。
頁碼：${page}`},
          {type:"input_image",image_url:image}
        ]
      }]
    });
    res.json({reply:r.output_text||"……"});
  }catch(err){
    console.error(err);
    res.status(500).json({error:"AI request failed"});
  }
});
app.listen(process.env.PORT||3000,()=>console.log("Echo Diary V6 running"));
