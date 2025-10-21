import React, { useState } from "react";
import axios from "axios";
import "./ResumeAnalyzer.css";

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setFeedback(null);
    setError("");
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please upload a resume file first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);
      setError("");
      const res = await axios.post(`${API}/api/ai/analyze-resume`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFeedback(res.data);
    } catch (err) {
      console.error(err);
      setError("Error analyzing resume. Try again!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resume-analyzer-container">
      <h2 className="title">AI Resume Analyzer</h2>
      <h3 >Note - (Not upload in binary format) </h3>

      <div className="upload-section">
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleFileChange}
          className="file-input"
        />
        
        <button onClick={handleAnalyze} className="analyze-btn" disabled={loading}>
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {feedback && (
        <div className="feedback-box">
          <h3>🧾 Summary</h3>
          <p>{feedback.summary}</p>

          <h3>💪 Strengths</h3>
          <ul>
            {feedback.strengths?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>⚠️ Weaknesses</h3>
          <ul>
            {feedback.weaknesses?.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>

          <h3>💡 Suggestions</h3>
          <ul>
            {feedback.suggestions?.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>

          <h3>🏆 Score: <span className="score">{feedback.score}/100</span></h3>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
