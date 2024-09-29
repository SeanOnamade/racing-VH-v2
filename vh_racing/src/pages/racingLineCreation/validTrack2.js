import React, { useState, useRef, useEffect } from 'react';
import Car2 from './Car2.js'; // Import the Car2 class

const ValidTrack2 = () => {
  const [fileName, setFileName] = useState('');
  const [trackData, setTrackData] = useState(null); // State to store track data
  const canvasRef = useRef(null);
  const originalWidth = 800;
  const originalHeight = 600;
  const scaleFactor = 4; // Set scaleFactor to 1 for now
  const carRef = useRef(null); // Ref for the Car2 object
  let cursorPosition = { x: 0, y: 0 }; // Declare cursor position with let

  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name); // Set the file name to display
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (Array.isArray(jsonData.track)) {
            setTrackData(jsonData); // Store the track data in state

            const points = jsonData.track.map(point => [point.x, point.y]); // Convert to array of [x, y]
            const streetDiameter = jsonData.streetDiameter; // Get the street diameter

            const scaledPoints = points.map(point => [point[0] * scaleFactor, point[1] * scaleFactor]); // Scale up by scaleFactor
            resizeCanvas(); // Resize canvas to scaleFactor times the original size

            drawTrack(scaledPoints, streetDiameter); // Call the drawing function with points and diameter
            
            // Initialize the Car2 object after drawing the track
            carRef.current = new Car2(
              { x: originalWidth * scaleFactor / 2, y: originalHeight * scaleFactor / 2 },
              { x: 2, y: 2 }, // Initial velocity
              0.05, // Friction
              originalWidth * scaleFactor,
              originalHeight * scaleFactor
            );
            requestAnimationFrame(() => animateCar(jsonData)); // Start animation loop
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

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(4, 112, 0)'; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background
  };

  const drawTrack = (points, streetDiameter) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const colors = ['grey', 'black']; // Array of colors for the track
    const widths = [streetDiameter * scaleFactor + 10 * scaleFactor, streetDiameter * scaleFactor]; // Scale widths

    if (points.length > 1) {
      for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i]; // Set line color
        ctx.lineWidth = widths[i]; // Set line width

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

  const animateCar = (jsonData) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const car = carRef.current;

    if (car) {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      ctx.fillStyle = 'rgb(4, 112, 0)'; // Set background color
      ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the background

      // Redraw the track
      const points = jsonData.track.map(point => [point.x * scaleFactor, point.y * scaleFactor]);
      drawTrack(points, jsonData.streetDiameter);

      // Draw the cursor position as a circle
      ctx.fillStyle = 'red'; // Set color for the cursor circle
      ctx.beginPath();
      ctx.arc(cursorPosition.x, cursorPosition.y, 10, 0, Math.PI * 2); // Draw the circle at cursor position
      ctx.fill(); // Fill the circle

      // Update and draw the car towards the cursor position
      const directionVector = {
        x: cursorPosition.x - car.position.x,
        y: cursorPosition.y - car.position.y
      };

      // Normalize the vector
      const length = Math.sqrt(directionVector.x ** 2 + directionVector.y ** 2);
      const normalizedVector = {
        x: (length > 0 ? directionVector.x / length : 0) * 1, // Scale to magnitude of 5
        y: (length > 0 ? directionVector.y / length : 0) * 1  // Scale to magnitude of 5
      };

      car.update2(normalizedVector); // Update car position
      car.draw(ctx); // Draw the car

      requestAnimationFrame(() => animateCar(jsonData)); // Loop the animation
    }
  };

  const handleMouseMove = (event) => {
    // Update cursor position
    cursorPosition.x = event.clientX - canvasRef.current.getBoundingClientRect().left;
    cursorPosition.y = event.clientY - canvasRef.current.getBoundingClientRect().top;

    // Print cursor position to console
    console.log(`Cursor Position: x=${cursorPosition.x}, y=${cursorPosition.y}`);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.addEventListener('mousemove', handleMouseMove);

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animateCar);
    };
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}> {/* Align left */}
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

export default ValidTrack2;
