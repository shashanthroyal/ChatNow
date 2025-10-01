import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './styles/Auth.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
  const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
  localStorage.setItem('token', res.data.token);
  localStorage.setItem('username', res.data.user.username); // Store username
  localStorage.setItem('id', res.data.user.id); // Store user ID
  alert('Logged in successfully!');
  navigate('/chat');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      setError(msg);
      alert(msg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" className="auth-button">Login</button>
        </form>
        {error && <p className="error-message">{error}</p>}
        <p className="auth-switch-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
