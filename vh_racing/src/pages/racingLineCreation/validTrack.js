import React, { useRef, useState, useEffect } from 'react';
import { Car, MassCategory, TireType } from '../../components/Car.js';
import Track from '../../components/Track.js';

// Modular car creation function
const createCar = (x, y, angle) => {
  const car = new Car(MassCategory.Medium, TireType.Slick, x, y);
  car.angle = angle;
  return car;
};

const ValidTrack = () => {
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef(null);
  const originalWidth = 800;
  const originalHeight = 600;
  const scaleFactor = 1;

  // CAR STUFF
  const [track, setTrack] = useState(new Track());
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [car, setCar] = useState(null);
  const [carPos, setCarPos] = useState([null]);
  const [carImage, setCarImage] = useState(null);
  const [initialCarState, setInitialCarState] = useState(null);
  const [keys, setKeys] = useState({ W: false, S: false, A: false, D: false });

  const carRadius = track.streetDiameter / 4;

  // Load car image from public folder
  useEffect(() => {
    const img = new Image();
    img.src = "/car.png";
    img.onload = () => setCarImage(img);
  }, []);

  // Add event listeners for keydown and keyup to capture car control inputs
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase(); // Handle both uppercase and lowercase input
      if (['W', 'A', 'S', 'D'].includes(key)) {
        setKeys((prevKeys) => ({ ...prevKeys, [key]: true }));
      }
    };
    const handleKeyUp = (event) => {
      const key = event.key.toUpperCase();
      if (['W', 'A', 'S', 'D'].includes(key)) {
        setKeys((prevKeys) => ({ ...prevKeys, [key]: false }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Update car position and physics based on key inputs
  useEffect(() => {
    const updateCarPosition = (deltaTime) => {
      if (car) {
        let throttle = keys.W ? 0.5 : 0;
        let brake = keys.S ? 0.5 : 0;
        let steeringInput = keys.A ? -0.5 : keys.D ? 0.5 : 0;

        if (throttle > 0) {
          car.applyThrottle(throttle, deltaTime);
        } else if (brake > 0) {
          car.applyBrake(brake, deltaTime);
        }

        if (steeringInput !== 0) {
          car.updateSteering(steeringInput, deltaTime);
        }

        car.updatePosition(deltaTime);
        setCarPos([car.getPositionX(), car.getPositionY()]);
      }
    };

    let lastTime = performance.now();
    const animationFrame = () => {
      const now = performance.now();
      const deltaTime = (now - lastTime) / 1000; // time difference in seconds
      updateCarPosition(deltaTime);
      lastTime = now;
      requestAnimationFrame(animationFrame);
    };
    requestAnimationFrame(animationFrame);
  }, [car, keys]);

  // Draw the track and car
  useEffect(() => {
    if (trackDrawnYet && carImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizeCanvas();

        // Draw the track with a thicker stroke
        ctx.lineWidth = 80; // Adjust this value to make the track thicker
        track.drawScaled(ctx, scaleFactor);

        // Draw the car only if it exists
        if (car && carPos) {
          const carWidth = 30;
          const carHeight = 20;
          ctx.save();
          ctx.translate(carPos[0], carPos[1]);  // Move the canvas origin to the car's position
          ctx.rotate(car.angle);                // Rotate the canvas around this new origin
          ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight); // Draw the car centered
          ctx.restore();                        // Restore the canvas context
        }
      };

      draw();
    }
  }, [track, carPos, carImage, trackDrawnYet, car]); // Add car to dependencies to re-render when car is set

  // Reset the car to its initial spawn position and orientation
  const resetCarToStart = () => {
    if (car && initialCarState) {
      car.positionX = initialCarState.positionX;
      car.positionY = initialCarState.positionY;
      car.velocity = 0;
      car.angle = initialCarState.angle;
      car.steeringAngle = 0;
      setCarPos([initialCarState.positionX, initialCarState.positionY]);
    }
  };

  // Handle driving the car after the track is fully loaded
  const handleDriveCar = () => {
    if (track.points.length > 1) { // Ensure there are at least two points to calculate the direction
      const startingPoint = track.points[0];
      const nextPoint = track.points[1];
      
      // Calculate the direction of the track between the first two points
      const dx = nextPoint[0] - startingPoint[0];
      const dy = nextPoint[1] - startingPoint[1];
      
      // Calculate the angle between the points, this gives the direction of the track
      const trackDirection = Math.atan2(dy, dx); // Angle in radians

      // Scale the car's position based on the track scaleFactor
      const scaledX = startingPoint[0] * scaleFactor;
      const scaledY = startingPoint[1] * scaleFactor;
      
      // Create car at the scaled starting position with the track direction angle
      const car = createCar(scaledX, scaledY, trackDirection);
      
      // Store the initial state for reset purposes
      setInitialCarState({ positionX: car.positionX, positionY: car.positionY, angle: car.angle });
      
      // Set the car's position and state
      setCar(car);
      setCarPos([scaledX, scaledY]);
    }
  };

  // Load the track from the file
  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result);
        const loadedTrack = new Track(jsonData.streetDiameter, jsonData.track.map((point) => [point.x, point.y]));
        setTrack(loadedTrack);

        // Wait for the track to be drawn before placing the car
        setTrackDrawnYet(false); // Reset to false while loading
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        resizeCanvas();
        loadedTrack.drawScaled(ctx, scaleFactor);

        setTrackDrawnYet(true); // Track is now drawn, so car can be placed
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };

  useEffect(() => {
    // Only drive the car if the track has been drawn
    if (trackDrawnYet) {
      handleDriveCar();
    }
  }, [trackDrawnYet]);

  // Resize the canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(4, 112, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
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
      {/*fileName && <p>Loaded File: {fileName}</p>*/}
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
