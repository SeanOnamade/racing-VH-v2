import React, { useRef, useState, useEffect } from 'react';

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

// React Component for the track drawing application
const TrackDrawingApp = () => {
  const canvasRef = useRef(null); // Reference to the canvas
  const [track, setTrack] = useState(new Track()); // State for the current track
  const [isDrawing, setIsDrawing] = useState(false); // State for drawing status
  const [mousePos, setMousePos] = useState([0, 0]); // Store mouse position
  const [trackDrawnYet, setTrackDrawnYet] = useState(false); // State to check if track is drawn

  // Effect to draw on the canvas when the track or mouse position changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.fillStyle = 'rgb(4, 112, 0)'; // Set the background color to green (RGB)
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the canvas with the green color	
      track.draw(ctx); // Draw the track on the canvas
    };

    draw(); // Call the draw function
  }, [track, mousePos, isDrawing]); // Dependencies for the effect

  // Handler for mouse down event to start drawing
  const handleMouseDown = (event) => {
    if (!isDrawing && !trackDrawnYet) { // Only draw if not already drawn
      setIsDrawing(true); // Set drawing state to true
      const rect = canvasRef.current.getBoundingClientRect(); // Get canvas position
      const pos = [event.clientX - rect.left, event.clientY - rect.top]; // Calculate mouse position
      track.clear(); // Clear the track before starting
      track.addPoint(pos); // Add the starting point
      setTrack(new Track(track.streetDiameter)); // Update track state
    }
  };

  // Handler for mouse up event to stop drawing
  const handleMouseUp = (event) => {
    if (isDrawing) {
      setIsDrawing(false); // Set drawing state to false
      const rect = canvasRef.current.getBoundingClientRect(); // Get canvas position
      const pos = [event.clientX - rect.left, event.clientY - rect.top]; // Calculate mouse position
      track.addPoint(pos); // Add the final point
      track.closeTrack(); // Close the track
      setTrackDrawnYet(true); // Set to true after drawing
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter); // Create a new Track instance
        updatedTrack.points = [...prevTrack.points]; // Copy previous points
        return updatedTrack; // Update track state
      });
    }
  };

  // Handler for mouse move event to track drawing
  const handleMouseMove = (event) => {
    if (isDrawing && !trackDrawnYet) { // Only track mouse movement while drawing
      const rect = canvasRef.current.getBoundingClientRect(); // Get canvas position
      const pos = [event.clientX - rect.left, event.clientY - rect.top]; // Calculate mouse position
      setMousePos(pos); // Update mouse position
      track.addPoint(pos); // Add the new point
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter); // Create a new Track instance
        updatedTrack.points = [...prevTrack.points]; // Copy previous points
        return updatedTrack; // Update track state
      });
    }
  };

  // Method to save the current track to a JSON file
  const saveTrack = () => {
    const { filename, trackData } = track.save(); // Get filename and track data
    const blob = new Blob([JSON.stringify(trackData, null, 2)], { type: 'application/json' }); // Create blob
    const link = document.createElement('a'); // Create link element
    link.href = URL.createObjectURL(blob); // Create object URL for the blob
    link.download = filename; // Set the download filename
    link.click(); // Trigger download
  };

  // Method to load a track from a JSON file
  const loadTrack = (event) => {
    const file = event.target.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader(); // Create a file reader
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result); // Parse JSON data
        console.log("Loaded data:", data); // Debug log

        // Create a new Track instance with the loaded street diameter and points
        const loadedTrack = new Track(data.streetDiameter, data.track.map(point => [point.x, point.y]));
        setTrack(loadedTrack); // Update the state with the new track
        setTrackDrawnYet(true); // Set to true after loading

        // Reset the file input to allow loading the same track again
        event.target.value = null; // Reset the file input
      };
      reader.readAsText(file); // Read file as text
    }
  };

  // Method to reset the track
  const resetTrack = () => {
    track.clear(); // Clear the track
    setTrack(new Track(track.streetDiameter)); // Reset track state
    setTrackDrawnYet(false); // Reset drawn state
  };

  // Render the component
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
      <canvas
        ref={canvasRef} // Reference to the canvas element
        width={800} // Set canvas width
        height={600} // Set canvas height
        onMouseDown={handleMouseDown} // Mouse down event handler
        onMouseUp={handleMouseUp} // Mouse up event handler
        onMouseMove={handleMouseMove} // Mouse move event handler
        style={{ border: '1px solid black', marginBottom: '20px' }} // Canvas styling
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={saveTrack} style={buttonStyle}>Save Track</button> {/* Button to save track */}
        <label style={buttonStyle}>
          Load Track
          <input type="file" onChange={loadTrack} style={{ display: 'none' }} /> {/* File input for loading track */}
        </label>
        <button onClick={resetTrack} style={buttonStyle}>Reset</button> {/* Button to reset track */}
      </div>
    </div>
  );
};

// Button style as a rectangle with text
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

// Export the TrackDrawingApp component as default
export default TrackDrawingApp;
