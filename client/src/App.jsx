import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Chat from './pages/Chat';
import './App.css'; // Assuming you have some global app CSS

export default function App() {
  const token = localStorage.getItem("token");

  return (
    <Router>
      <Navbar key={token} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/" element={<Navigate to={token ? "/chat" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}
