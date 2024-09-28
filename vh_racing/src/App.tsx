import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import logo from './logo.svg';
import './App.css';

// New Ethan component for /ethan route
const EthanPage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Ethan's Page!</h1>
      <p>This is the page you see when you navigate to /ethan.</p>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Default App route */}
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

        {/* Ethan page route */}
        <Route path="/ethan" element={<EthanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
