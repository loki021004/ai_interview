import { useState } from "react";
import axios from "axios";
import "./Interview.css";

const InterviewPage = () => {
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [feedback, setFeedback] = useState([]);
  const [totalScore, setTotalScore] = useState(0);


  // Generate questions using Gemini API
  const handleGenerateQuestions = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/ai/interview/questions", { role, description });
      setQuestions(res.data.questions);

    } catch (err) {
      console.error(err);
    }
  };

  // Submit answers and get feedback
const handleSubmitAnswers = async () => {
  try {
    const payload = questions.map((q, i) => ({
      question: q,
      answer: answers[i] || ""
    }));

    const res = await axios.post("http://localhost:3001/api/ai/interview/evaluate", {
      role,
      answers: payload
    });

    setFeedback(res.data.feedback);
    setTotalScore(res.data.totalScore); // <-- set total score
  } catch (err) {
    console.error(err);
    alert("Error submitting answers. Check console.");
  }
};


  return (
    <div className="interview-container">
      <h1>AI Interview Simulator</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Role (e.g., Software Engineer)"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
        <textarea
          placeholder="Job Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <button className="btn" onClick={handleGenerateQuestions}>Start Interview</button>
      </div>

      {questions.length > 0 && (
        <div className="questions-section">
          {questions.map((q, i) => (
            <div key={i} className="question-card">
              <p><strong>Q{i + 1}:</strong> {q}</p>
              <input
                type="text"
                placeholder="Your answer"
                value={answers[i] || ""}
                onChange={(e) => setAnswers({ ...answers, [i]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn submit-btn" onClick={handleSubmitAnswers}>Submit Answers</button>
        </div>
      )}

      {feedback.length > 0 && (
        <div className="feedback-section">
          <h2>Feedback & Scores</h2>
         {feedback.map((f, i) => (
  <div key={i} className="feedback-item">
    <p><strong>Question:</strong> {f.question}</p>
    <p><strong>Mark:</strong> {f.mark} / 10</p>
    <p><strong>Comment:</strong> {f.comment}</p>
  </div>
))}
  <h3>Total Score: {totalScore} / 50</h3>
        </div>
      )}
    </div>
  );
};

export default InterviewPage;
