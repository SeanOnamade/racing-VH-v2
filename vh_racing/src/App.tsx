import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';
import Signup from './pages/Signup';
import Login from './pages/Login';
import { Sign } from 'crypto';
import RacingLines from './pages/racingLineCreation/racingLines';
import ValidTrack from './pages/racingLineCreation/validTrack';
import CarTest from './pages/racingLineCreation/carTest';
import Navbar from './components/Navbar';  // Import the Navbar component

// Main App component
const App:React.FC = () => {
  return (
    <Router>
      <Navbar />
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
        <Route path="/ethan" element={<RacingLines />} />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/zander" element={<CarTest />} />
        <Route path="/ethan/validTrack" element={<ValidTrack />} />
      </Routes>
    </Router>
  );
};


export default App;
