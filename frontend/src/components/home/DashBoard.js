import React,{ useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import "./DashBoard.css";

const Dashboard = ( ) => {
  const [user, setUser] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);


  return (
    <div className="dashboard-container">
      {/* Navbar Section */}
      <nav className="dashboard-navbar">
        <h1 className="logo">Interview Guide</h1>
        <button className="logout-btn" onClick={() => navigate("/login")}>Logout</button>
      </nav>

      {/* Welcome Section */}
      <div className="dashboard-content">
        <h2 className="welcome-text">Welcome, {user?.name || "User"} 👋</h2>
        <p className="description">
          Your personal career companion! Explore AI tools to study, test your skills, 
          build your resume, and prepare for interviews — all in one place.
        </p>

        {/* Feature Buttons */}
        <div className="button-row">
          <button onClick={() => navigate("/chatbot")}>📘 Study</button>
          <button onClick={() => navigate("/aptitude")}>🧠 Aptitude</button>
          <button onClick={() => navigate("/coding")}>💻 Coding</button>
          <button onClick={() => navigate("/resume")}>📄 Resume Analyzer</button>
          <button onClick={() => navigate("/interview")}>🤖 AI Interview</button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
