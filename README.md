# Echo Diary V17

V17 fixes the server startup bug in the previous V16 package. The `/health` route is now registered after the Express app is created. It also keeps the existing handwriting vision flow and `1024` birthday surprise.

Render:
- Build Command: npm install
- Start Command: npm start
- Environment variable: OPENAI_API_KEY

Health check: `/health`
