import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import RacingLines from './pages/racingLineCreation/racingLine';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { Sign } from 'crypto';


// Main App component
const App:React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Default Route - Home Page */}
        <Route
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
        />

        {/* Ethan page route - Using RacingLines component */}
        <Route path="/ethan" element={<RacingLines />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};


export default App;
