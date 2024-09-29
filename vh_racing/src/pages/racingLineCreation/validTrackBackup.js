import React, { useState, useRef } from 'react';

const ValidTrack = () => {
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef(null);
  const originalWidth = 800;
  const originalHeight = 600;
  const scaleFactor = 4; // Constant scaling factor

  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Set the file name to display
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          // Check if track exists in jsonData and is an array
          if (Array.isArray(jsonData.track)) {
            const points = jsonData.track.map(point => [point.x, point.y]); // Convert to array of [x, y]
            const streetDiameter = jsonData.streetDiameter; // Get the street diameter
            
            // Scale points and resize canvas
            const scaledPoints = points.map(point => [point[0] * scaleFactor, point[1] * scaleFactor]); // Scale up by scaleFactor
            resizeCanvas(); // Resize canvas to scaleFactor times the original size
            
            drawTrack(scaledPoints, streetDiameter); // Call the drawing function with points and diameter
          } else {
            console.error("Invalid data format: 'track' is not an array");
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      };
      reader.readAsText(file); // Read the file as text
      event.target.value = null; // Reset the input
    }
  };

  // Method to resize the canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;
    
    // Clear and redraw the track after resizing
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(4, 112, 0)'; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background
  };

  // Method to draw the track on the canvas
  const drawTrack = (points, streetDiameter) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colors = ['grey', 'black']; // Array of colors for the track
    const widths = [streetDiameter * scaleFactor + 10*scaleFactor, streetDiameter * scaleFactor]; // Scale widths

    // Draw the lines and rounded ends for both colors
    if (points.length > 1) {
      for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i]; // Set line color
        ctx.lineWidth = widths[i]; // Set line width

        // Draw the lines
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]); // Start from the first point
        for (let j = 1; j < points.length; j++) {
          ctx.lineTo(points[j][0], points[j][1]); // Draw line to each subsequent point
        }
        ctx.stroke(); // Render the line

        // Draw rounded ends
        ctx.fillStyle = colors[i]; // Set fill color
        for (const point of points) {
          ctx.beginPath();
          ctx.arc(point[0], point[1], widths[i] / 2, 0, Math.PI * 2); // Draw a circle at the point
          ctx.fill(); // Fill the circle
        }
      }
    } else {
      console.error("No points to draw.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}> {/* Align left */}
      {/* Blank Canvas */}
      <canvas
        ref={canvasRef}
        width={originalWidth} 
        height={originalHeight} 
        style={{ border: '1px solid black', marginBottom: '20px', display: 'block' }} 
      />
      <label style={buttonStyle}>
        Load Track
        <input type="file" accept=".json" onChange={loadTrack} style={{ display: 'none' }} />
      </label>
      {fileName && <p>Loaded File: {fileName}</p>} {/* Display the loaded file name */}
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

export default ValidTrack;
