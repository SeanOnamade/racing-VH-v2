import React, { useState } from 'react';
import axios from 'axios';
// import './AuthPage.css';  // You can style your page here

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);  // Switch between login and signup
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  // Switch between login and signup modes
  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setFormData({ username: '', email: '', password: '' });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLoginMode ? 'login' : 'signup';
      const res = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      if (isLoginMode) {
        localStorage.setItem('token', res.data.token); // Save token on login
        window.location.href = '/ethan';  // Redirect to ethan page
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="auth-page">
      <div className={`auth-container ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
        {/* Signup Section */}
        {!isLoginMode && (
          <form onSubmit={handleSubmit}>
            <h2>Signup</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Signup</button>
            <p>Already have an account? <button type="button" onClick={switchMode}>Login</button></p>
          </form>
        )}

        {/* Login Section */}
        {isLoginMode && (
          <form onSubmit={handleSubmit}>
            <h2>Login</h2>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit">Login</button>
            <p>New here? <button type="button" onClick={switchMode}>Signup</button></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
