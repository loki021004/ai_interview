import express from 'express';
import connectDB from './config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoute from './routes/UserRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 🧩 CORS setup — allow frontend URLs (local + deployed)
const allowedOrigins = [
  'http://localhost:3000', // local React
  'https://mern-ai-interview-.netlify.app', // 🔁 Replace with your Netlify or Vercel frontend URL
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

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
