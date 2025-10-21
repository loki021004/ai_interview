import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoute from './routes/UserRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🧩 CORS setup — allow localhost during dev & Render domain during deploy
const allowedOrigins = [
  'http://localhost:3000',
  'https://mern-ai.onrender.com', // ✅ Replace this with your Render frontend URL after deploy
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ API routes
app.use("/api/auth", authRoute);
app.use("/api/ai", aiRoutes);

// 🧠 Connect to MongoDB before starting the server
connectDB();

// 🧩 Serve React frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // For any route not starting with /api → serve frontend
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
