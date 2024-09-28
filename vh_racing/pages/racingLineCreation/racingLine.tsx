import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// EthanPage component
const EthanPage: React.FC = () => {
  return (
    <div>
      <h1>Welcome to Ethan's Page!</h1>
      <p>This is the page you see when you navigate to /ethan.</p>
    </div>
  );
};

// Main RacingLines component
const RacingLines: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Default Route - Home Page */}
        <Route
          path="/"
          element={
            <div>
              <h1>Racing Lines Home</h1>
              <p>Edit <code>src/racingLines.tsx</code> to modify this page.</p>
            </div>
          }
        />

        {/* Route for /ethan */}
        <Route path="/ethan" element={<EthanPage />} />
      </Routes>
    </Router>
  );
};

export default RacingLines;
