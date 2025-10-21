import { useState, useEffect } from "react";
import axios from "axios";
import "./Aptitude.css"

const Aptitude = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Generate aptitude questions from AI
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:3001/api/ai/chat", {
        message:
          "Generate 10 aptitude multiple-choice questions in pure JSON format. Each object should contain: question, options (array of 4), and correct answer. Keep it simple.",
      });

      // Clean up AI response text and parse JSON
      const text = res.data.reply;
      const start = text.indexOf("[");
      const end = text.lastIndexOf("]");
      const jsonText = text.slice(start, end + 1);
      const data = JSON.parse(jsonText);

      setQuestions(data);
    } catch (err) {
      console.error("Error loading questions:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Step 2: Track user's selected answers
  const handleAnswerChange = (index, option) => {
    setAnswers({ ...answers, [index]: option });
  };

  // Step 3: Send answers to AI for checking and feedback
  const handleCheckAnswers = async () => {
    setLoading(true);
    try {
      const reviewPrompt = `
      Review the following aptitude answers.
      Questions and correct answers:
      ${JSON.stringify(questions, null, 2)}
      User answers:
      ${JSON.stringify(answers, null, 2)}
      Evaluate and give marks out of ${questions.length}. 
      Also provide a short feedback like "Good job" or "Needs improvement".
      Return the output in pure JSON with keys: score and feedback.
      `;

      const res = await axios.post("http://localhost:3001/api/ai/chat", {
        message: reviewPrompt,
      });

      const text = res.data.reply;
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      const jsonText = text.slice(start, end + 1);
      const aiResult = JSON.parse(jsonText);

      setResult(aiResult);
    } catch (err) {
      console.error("Error checking answers:", err);
    }
    setLoading(false);
  };

  return (
    <div className="aptitude-container" style={{ padding: "30px", textAlign: "center" }}>
      <h2>🧠 AI Aptitude Test</h2>
      {loading && <p>Loading...</p>}

      {!loading && questions.length === 0 && (
        <button onClick={fetchQuestions}>Start Test</button>
      )}

      {questions.map((q, i) => (
        <div
          key={i}
          style={{
            background: "#f8f9ff",
            margin: "15px auto",
            padding: "15px",
            borderRadius: "10px",
            width: "80%",
            textAlign: "left",
          }}
        >
          <h3>
            {i + 1}. {q.question}
          </h3>
          {q.options.map((opt, idx) => (
            <div key={idx}>
              <label>
                <input
                  type="radio"
                  name={`q${i}`}
                  value={opt}
                  checked={answers[i] === opt}
                  onChange={() => handleAnswerChange(i, opt)}
                />{" "}
                {opt}
              </label>
            </div>
          ))}
        </div>
      ))}

      {questions.length > 0 && (
        <button
          onClick={handleCheckAnswers}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "8px",
          }}
        >
          Check Answers
        </button>
      )}

      {result && (
        <div style={{ marginTop: "20px" }}>
          <h3>✅ Your Score: {result.score} / {questions.length}</h3>
          <p>💬 Feedback: {result.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default Aptitude;
