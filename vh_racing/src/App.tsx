import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import RacingLines from './pages/racingLineCreation/racingLines';
import ValidTrack from './pages/racingLineCreation/validTrack';
import Navbar from './components/Navbar';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';

// Main App component
const App:React.FC = () => {
  const token = localStorage.getItem('token');

  // A PrivateRoute wrapper to protect authenticated routes
  const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    return token ? children : <Navigate to="/auth" />;  // Redirect to AuthPage if not authenticated
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Default Route - Home Page */}
        {/* <Route
          path="/"
          element={
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <p>Edit <code>src/App.tsx</code> and save to reload.</p>
                <a
                  className="App-link"
                  href="https://reactjs.org"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn React
                </a>
              </header>
            </div>
          }
        /> */}
        <Route path="/" element={<HomePage />} />
        {/* <Route path="/zander" element={<CarTest />} /> */}
        <Route path="/draw" element={<RacingLines />} />
        <Route path="/race" element={<ValidTrack />} />

        {/* Auth Route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Example of protected routes (accessible only after logging in) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <>
              <h1>Dashboard</h1> {/* A protected route */}
              </>
            </PrivateRoute>
          }
        />

        {/* <Route path="/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} /> */}
        
      </Routes>
    </Router>
  );
};


export default App;
