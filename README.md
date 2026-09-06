# Echo Diary V6

這是「免前端設定」版的完整專案。

重要：要做到「雙擊 HTML 就直接有真正 AI」，必須有一個已經部署好的後端服務；API 金鑰不能安全地放進 HTML。
因此這份 V6 已把前端與後端全部整理好，但「公開部署」仍需要一個雲端主機與 API 金鑰。

流程：
手寫 Canvas → PNG → /api/diary → OpenAI Vision → 讀懂繁體中文手寫 → 回答 → 回答淡出 → 下一頁。

啟動方式（若自己部署）：
1. 安裝 Node.js 20+
2. 在本資料夾執行 npm install
3. 設定環境變數 OPENAI_API_KEY
4. npm start
5. 開啟 http://localhost:3000

前端完全不需要 API Key，也不需要使用者輸入設定。
