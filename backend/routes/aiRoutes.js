import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import cors from "cors";
import multer from "multer";
import fs from "fs"; // For PDF files
import { createRequire } from "module";


dotenv.config();
const require = createRequire(import.meta.url);
 // ✅ CommonJS import in ESM
const mammoth = require("mammoth"); 
const router = express.Router();
router.use(cors()); // enable CORS for frontend requests

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ------------------- Chatbot Route -------------------
router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(message);

    res.json({ reply: result.response.text() });
  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ reply: "Error connecting to AI service." });
  }
});

// ------------------- Coding Questions Route -------------------
router.get("/coding-questions", async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      Generate 5 beginner-friendly coding questions (JavaScript or Python). 
      Return ONLY a JSON array of strings.
    `;
    const result = await model.generateContent(prompt);

    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      const firstNewline = text.indexOf("\n");
      const lastTriple = text.lastIndexOf("```");
      text = text.substring(firstNewline + 1, lastTriple).trim();
    }

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch (err) {
      console.error("AI JSON parse failed:", err, text);
      questions = ["Working backend"];
    }

    res.json(questions);
  } catch (err) {
    console.error("Coding questions error:", err);
    res.status(500).json({ message: "Failed to fetch coding questions" });
  }
});

// ------------------- Evaluate Coding Answers Route -------------------
router.post("/evaluate-coding", async (req, res) => {
  try {
    const { answers } = req.body; // [{ question, code }, ...]
    const feedback = [];
    let score = 0;

    for (let i = 0; i < answers.length; i++) {
      const { question, code } = answers[i];
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Evaluate this code for the following question:
        Question: ${question}
        Code: ${code}
        Give a short feedback and mark it 1 if correct or 0 if wrong. 
        Return ONLY JSON: {"mark":1 or 0, "comment":"feedback"}
      `;

      const result = await model.generateContent(prompt);

      let text = result.response.text().trim();
      if (text.startsWith("```")) {
        const firstNewline = text.indexOf("\n");
        const lastTriple = text.lastIndexOf("```");
        text = text.substring(firstNewline + 1, lastTriple).trim();
      }

      let parsed = { mark: 0, comment: "Could not evaluate answer." };
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        console.error("AI JSON parse failed:", err, text);
      }

      score += parsed.mark;
      feedback.push({ question, ...parsed });
    }

    res.json({ score, feedback });
  } catch (err) {
    console.error("Evaluate coding error:", err);
    res.status(500).json({ message: "Failed to evaluate answers" });
  }
});

// ------------------- Resume Analyzer Route -------------------
const upload = multer({ dest: "uploads/" });

router.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No resume uploaded" });

    const filePath = req.file.path;
    let text = "";

    // Determine file type
    if (req.file.mimetype === "application/pdf") {
      // PDF
      
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text.slice(0, 3000); // Take first 3000 chars
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      req.file.mimetype === "application/msword"
    ) {
      // DOC/DOCX
      const buffer = fs.readFileSync(filePath);
      const docData = await mammoth.extractRawText({ buffer });
      text = docData.value.slice(0, 3000);
    } else {
      fs.unlinkSync(filePath);
      return res.status(400).json({ message: "Unsupported file type" });
    }

    fs.unlinkSync(filePath); // Delete file after reading

    // ------------------- Send to AI -------------------
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an AI resume expert.
      Analyze this resume and return ONLY JSON in this format:
      {
        "summary": "short summary",
        "strengths": ["point1", "point2"],
        "weaknesses": ["point1", "point2"],
        "suggestions": ["improvement1", "improvement2"],
        "score": 0-100
      }

      Resume content:
      ${text}
    `;

    const result = await model.generateContent(prompt);
    let aiText = result.response.text().trim();

    if (aiText.startsWith("```")) {
      const firstNewline = aiText.indexOf("\n");
      const lastTriple = aiText.lastIndexOf("```");
      aiText = aiText.substring(firstNewline + 1, lastTriple).trim();
    }

    let feedback;
    try {
      feedback = JSON.parse(aiText);
    } catch (err) {
      console.error("AI JSON parse failed:", err, aiText);
      feedback = {
        summary: "Could not parse AI response.",
        strengths: [],
        weaknesses: [],
        suggestions: [],
        score: 0,
      };
    }

    res.json(feedback);
  } catch (error) {
    console.error("Resume analysis error:", error);
    res.status(500).json({ message: "Failed to analyze resume" });
  }
});

// ------------------- AI Interview Routes -------------------
router.post("/interview/questions", async (req, res) => {
  try {
    const { role, description } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `
      You are an HR expert.
      Generate 5 interview questions for the role: ${role}.
      Job description: ${description}
      Return ONLY a JSON array of strings.
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith("```")) {
      const firstNewline = text.indexOf("\n");
      const lastTriple = text.lastIndexOf("```");
      text = text.substring(firstNewline + 1, lastTriple).trim();
    }

    let questions = [];
    try {
      questions = JSON.parse(text);
    } catch (err) {
      console.error("AI JSON parse failed:", err, text);
      questions = ["Failed to generate questions"];
    }

    res.json({ questions });
  } catch (err) {
    console.error("Interview questions error:", err);
    res.status(500).json({ message: "Failed to generate interview questions" });
  }
});

router.post("/interview/evaluate", async (req, res) => {
  try {
    const { role, answers } = req.body; // answers: [{ question, answer }, ...]

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // ✅ Combine all answers into one prompt
    const prompt = `
      You are an HR expert. Evaluate the following answers for the role: ${role}.

      Questions and answers:
      ${answers.map((a, i) => `${i + 1}. Q: ${a.question}\n   A: ${a.answer}`).join("\n")}

      Return ONLY a JSON array of objects like:
      [{"question":"...","mark":number,"comment":"..."}, ...]
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Remove triple backticks if present
    if (text.startsWith("```")) {
      const firstNewline = text.indexOf("\n");
      const lastTriple = text.lastIndexOf("```");
      text = text.substring(firstNewline + 1, lastTriple).trim();
    }

    let feedback = [];
    try {
      feedback = JSON.parse(text);
    } catch (err) {
      console.error("AI JSON parse failed:", err, text);
      feedback = answers.map(a => ({
        question: a.question,
        mark: 0,
        comment: "Could not evaluate"
      }));
    }

    // Calculate total score
    const totalScore = feedback.reduce((acc, f) => acc + f.mark, 0);

    res.json({ totalScore, feedback });
  } catch (err) {
    console.error("Interview evaluation error:", err);
    res.status(500).json({ message: "Failed to evaluate interview answers" });
  }
});


export default router;
