import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/login/Login'
import Register from './components/login/Register';
import UserDetails from './components/login/UserDetails';
import ChatBot from "./components/study/ChatBot";
import DashBoard from './components/home/DashBoard';
import Aptitude from './components/aptitude/Aptitude';
import CodingTest from './components/coding/CodingTest';
import ResumeAnalyzer from './components/resume/ResumeAnalyzer';
import InterviewPage from './components/interview/Interview';

function App() {

  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/userDetails" element={<UserDetails />} />
          <Route path="/DashBoard" element={<DashBoard />} />
          <Route path="/chatbot" element={<ChatBot />} />
          <Route path="/aptitude" element={<Aptitude />} />
          <Route path="/coding" element={<CodingTest />} />
          <Route path="/resume" element={<ResumeAnalyzer />} />
          <Route path="/interview" element={<InterviewPage />} />
          {/* Add more routes here if needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;