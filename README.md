# 湯姆瑞斗的日記 (Tom Riddle's Diary)

基於《哈利波特》湯姆·瑞斗日記設定的互動網頁專案。

## 專案亮點
1. **墨水滲透與消失效果**：輸入文字後 1.5 秒自動淡出被日記本吸收。
2. **湯姆·瑞斗 AI 回應**：浮現綠色墨水字體回應。
3. **1024 驚喜彩蛋**：寫下 `1024` 時，回應「**吳悠生日快樂**」並發射滿天煙火！

---

## 部署教學 (GitHub + Render)

### 方式一：直接上傳 ZIP 內容至 GitHub
1. 下載並解壓縮 ZIP 檔。
2. 將裡面的所有檔案（`index.html`, `server.js`, `package.json`, `README.md`）直接上傳到 GitHub 儲存庫（Repository）的**根目錄**（不要包含外層資料夾）。

### 方式二：在 Render 部署
1. 登入 [Render](https://render.com/)，點擊 **New +** -> **Web Service**。
2. 連結你的 GitHub 儲存庫。
3. 設定：
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. (可選) 在 Environment Variables 新增 `OPENAI_API_KEY`。
5. 點擊 **Create Web Service** 即可完成部署！
