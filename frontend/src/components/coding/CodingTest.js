import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CodingTest.module.css'; // make sure your CSS file is named CodingTest.module.css

const CodingTest = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [code, setCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true); // start with loading

  // Fetch 5 coding questions from backend/AI
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/ai/coding-questions'); // use full URL for testing
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
        // fallback questions if AI fails
        setQuestions([
          "not workings"
        ]);
      }
      setLoading(false);
    };
    fetchQuestions();
  }, []);

 const handleNext = () => {
  const newAnswers = [...answers, { question: questions[currentQ], code }];
  setAnswers(newAnswers);
  setCode('');

  if (currentQ + 1 < questions.length) {
    setCurrentQ(currentQ + 1);
  } else {
    submitAnswers(newAnswers); // Pass the full array including last answer
  }
};


  const handleSkip = () => {
    setAnswers([...answers, { question: questions[currentQ], code: "" }]);
    setCode('');
    if (currentQ + 1 < questions.length) {
      setCurrentQ(currentQ + 1);
    } else {
      submitAnswers();
    }
  };

const submitAnswers = async (finalAnswers) => {
  setLoading(true);
  try {
    const res = await axios.post('http://localhost:3001/api/ai/evaluate-coding', { answers: finalAnswers });
    setResult(res.data); // { score: X, feedback: [...] }
  } catch (err) {
    console.error("Failed to evaluate answers:", err);
  }
  setLoading(false);
};

 



  if (loading) return <p>Loading questions...</p>;
  if (result) {
    return (
      <div className={styles.container}>
        <h2 className={styles.score}>Your Score: {result.score}/5</h2>
        {result.feedback.map((f, i) => (
          <div key={i} className={styles.feedbackItem}>
            <h4>Q{i + 1}: {f.question}</h4>
            <p>{f.comment}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.questionHeader}>
        Question {currentQ + 1} of {questions.length}
      </h3>
      <p className={styles.questionText}>{questions[currentQ]}</p>
      <textarea
        className={styles.textarea}
        value={code}
        onChange={(e) => setCode(e.target.value)}
        rows={10}
        cols={80}
        placeholder="Write your code here..."
      />
      <div className={styles.buttonGroup}>
        <button className={styles.button} onClick={handleNext}>
          {currentQ + 1 === questions.length ? 'Submit' : 'Next'}
        </button>
        <button className={styles.button} onClick={handleSkip}>Skip</button>
      </div>
    </div>
  );
};

export default CodingTest;
