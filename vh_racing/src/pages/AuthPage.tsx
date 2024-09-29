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
        window.location.href = '/';  // Redirect to ethan page
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="flex auth-page min-h-screen items-center bg-slate-100 justify-center">
            <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4 max-w-md w-full">

      <div className={`auth-container ${isLoginMode ? 'login-mode' : 'signup-mode'}`}>
        {/* Signup Section */}
        {!isLoginMode && (
          <form onSubmit={handleSubmit}>
            <h2 className="text-center text-2xl font-bold mb-4">Signup</h2>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className="rounded-lg bg-white border-solid border-2 p-5 w-full mb-4"
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="rounded-lg bg-white border-solid border-2 p-5 w-full mb-4"
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="rounded-lg bg-white border-solid border-2 p-5 w-full mb-4"
              required
            />
            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full" type="submit">Signup</button>
            <p className='text-center mt-4'> <button type="button" onClick={switchMode}> Already have an account? Login</button></p>
          </form>
        )}

        {/* Login Section */}
        {isLoginMode && (
          <form onSubmit={handleSubmit} className='space-x-2'>
            <h2 className='text-center text-2xl font-bold mb-4'>Login</h2>
            <input
              className="rounded-lg bg-white border-solid border-2 p-5 w-full mb-4"
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              className="rounded-lg bg-white border-solid border-2 p-5 w-full mb-4"
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg w-full" type="submit">Login</button>
            <p className='text-center mt-4'> <button type="button" onClick={switchMode}> New here? Signup</button></p>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};

export default AuthPage;
