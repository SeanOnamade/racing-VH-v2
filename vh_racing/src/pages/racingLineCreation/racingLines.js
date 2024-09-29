import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Track class definition
class Track {
  constructor(streetDiameter = 20, points = []) {
    this.points = points; // Initialize with passed points
    this.drawing = false; // Flag for drawing state
    this.streetDiameter = streetDiameter; // Diameter of the street
  }

  // Method to add a point to the track
  addPoint(pos) {
    this.points.push(pos);
  }

  // Method to close the track by connecting the last point to the first
  closeTrack() {
    if (this.points.length) {
      this.points.push(this.points[0]); // Close the track
    }
  }

  // Method to save the track data as JSON
  save() {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000; // Generate random number for filename
    const filename = `track_${randomNumber}.json`; // Create filename
    const trackData = {
      track: this.points.map(([x, y]) => ({ x, y })), // Format points for JSON
      streetDiameter: this.streetDiameter, // Include street diameter
    };
    return { filename, trackData }; // Return filename and data
  }

  // Method to load track data from JSON
  load(data) {
    this.points = data.track.map(point => [point.x, point.y]); // Convert JSON points back to array
    this.streetDiameter = data.streetDiameter || 10; // Default to 10 if not in JSON
  }

  // Method to clear the track
  clear() {
    this.points = []; // Clear points
    this.drawing = false; // Reset drawing state
  }

  // Method to draw the track on the canvas
  draw(ctx) {
    const colors = ['grey', 'black']; // Array of colors for the track
    const widths = [this.streetDiameter + 10, this.streetDiameter]; // Widths: 10 pixels wider and original

    // Draw the lines and rounded ends for both colors
    if (this.points.length > 1) {
      for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i]; // Set line color
        ctx.lineWidth = widths[i]; // Set line width

        // Draw the lines
        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]); // Start from the first point
        for (let j = 1; j < this.points.length; j++) {
          ctx.lineTo(this.points[j][0], this.points[j][1]); // Draw line to each subsequent point
        }
        ctx.stroke(); // Render the line

        // Draw rounded ends
        ctx.fillStyle = colors[i]; // Set fill color
        for (const point of this.points) {
          ctx.beginPath();
          ctx.arc(point[0], point[1], widths[i] / 2, 0, Math.PI * 2); // Draw a circle at the point
          ctx.fill(); // Fill the circle
        }
      }
    }
  }

  // Method to get the count of points in the track
  getPointsCount() {
    return this.points.length; // Returns the number of points
  }
}

const TrackDrawingApp = () => {
  const canvasRef = useRef(null);
  const [track, setTrack] = useState(new Track());
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [savedYet, setSavedYet] = useState(false); // Initialize savedYet
  const navigate = useNavigate(); // Initialize the navigate function

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.fillStyle = 'rgb(4, 112, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx);
    };

    draw();
  }, [track, mousePos, isDrawing]);

  const handleMouseDown = (event) => {
    if (!isDrawing && !trackDrawnYet) {
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];
      track.clear();
      track.addPoint(pos);
      setTrack(new Track(track.streetDiameter));
    }
  };

  const handleMouseUp = (event) => {
    if (isDrawing) {
      setIsDrawing(false);
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];
      track.addPoint(pos);
      track.closeTrack();
      setTrackDrawnYet(true);
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
    }
  };

  const handleMouseMove = (event) => {
    if (isDrawing && !trackDrawnYet) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];
      setMousePos(pos);
      track.addPoint(pos);
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
    }
  };

  const saveTrack = () => {
    if (savedYet) return; // Skip saving if savedYet is true

    const { filename, trackData } = track.save();
    const blob = new Blob([JSON.stringify(trackData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    setSavedYet(true); // Set savedYet to true when saving
  };

  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        const loadedTrack = new Track(data.streetDiameter, data.track.map(point => [point.x, point.y]));
        setTrack(loadedTrack);
        setTrackDrawnYet(true);
        setSavedYet(true); // Set savedYet to true when loading
        event.target.value = null;
      };
      reader.readAsText(file);
    }
  };

  const resetTrack = () => {
    track.clear();
    setTrack(new Track(track.streetDiameter));
    setTrackDrawnYet(false);
    setSavedYet(false); // Set savedYet to false when resetting
  };

  const handleValidateTrack = () => {
    saveTrack(); // Save the track file when validating
    navigate('/ethan/validTrack');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ border: '1px solid black', marginBottom: '20px' }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={saveTrack} style={{ ...buttonStyle, opacity: savedYet ? 0.5 : 1 }} disabled={savedYet}>
          Save Track
        </button>
        <label style={buttonStyle}>
          Load Track
          <input type="file" onChange={loadTrack} style={{ display: 'none' }} />
        </label>
        <button onClick={resetTrack} style={buttonStyle}>Reset</button>
        <button onClick={handleValidateTrack} style={buttonStyle}>Validate Track</button>
      </div>
      {/* Display savedYet value */}
      <div style={{ marginTop: '20px', fontSize: '18px' }}>
        Saved Yet: {savedYet.toString()}
      </div>
    </div>
  );
};

const buttonStyle = {
  backgroundColor: 'green',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  textAlign: 'center',
};

export default TrackDrawingApp;
