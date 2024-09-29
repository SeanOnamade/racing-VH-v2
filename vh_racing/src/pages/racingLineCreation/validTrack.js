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
  const [carPos, setCarPos] = useState([null]); // Initialize car position. maybe make null it was before
  const [carImage, setCarImage] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [keys, setKeys] = useState({ ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false });
  const [lastTime, setLastTime] = useState(performance.now());
  const [initialCarState, setInitialCarState] = useState(null); // Store initial car state

  const carRadius = track.streetDiameter / 4;

  // Load car image from public folder
  useEffect(() => {
    const img = new Image();
    img.src = "/car.png"; // Path to your car image
    img.onload = () => setCarImage(img);
  }, []);

  // Draw the track and car
  useEffect(() => {
    if (trackDrawnYet && carImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        // Clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizeCanvas(); // Resize the canvas again to maintain the background

        // Draw the track
        track.drawScaled(ctx, scaleFactor);

        // Draw the car
        if (carPos) {
          const carWidth = 40; // Example car width, adjust as necessary
          const carHeight = 30; // Example car height, adjust as necessary
          ctx.save();
          ctx.translate(carPos[0], carPos[1]);
          ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
          ctx.restore();
        }
      };

      draw();
    }
  }, [track, carPos, carImage, trackDrawnYet]);


// Handle steering reset to zero when no keys are pressed
const resetSteering = (car, deltaTime) => {
    if (car.steeringAngle > 0) {
      car.updateSteering(-0.2, deltaTime); // Gradually reduce the angle
    } else if (car.steeringAngle < 0) {
      car.updateSteering(0.2, deltaTime); // Gradually increase the angle
    }
  };

  // Reset the car to its initial spawn position and orientation
  const resetCarToStart = () => {
    if (car && `initialCarState`) {
      car.positionX = initialCarState.positionX;
      car.positionY = initialCarState.positionY;
      car.velocity = 0;
      car.angle = initialCarState.angle;
      car.steeringAngle = 0;
      setCarPos([initialCarState.positionX, initialCarState.positionY]);
    }
  };

  useEffect(() => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000; // Calculate time difference in seconds
    setLastTime(now);

    if (car) {
      let throttle = keys.ArrowUp ? 0.5 : 0;
      let brake = keys.ArrowDown ? 0.5 : 0;
      let steeringInput = keys.ArrowLeft ? -0.5 : keys.ArrowRight ? 0.5 : 0;

      if (throttle > 0) {
        car.applyThrottle(throttle, deltaTime);
      } else if (!keys.ArrowUp && !keys.ArrowDown) {
        car.applyThrottle(0, deltaTime); // Maintain momentum when no throttle/brake
      }

      if (brake > 0) {
        car.applyBrake(brake, deltaTime);
      } else if (!keys.ArrowUp && !keys.ArrowDown) {
        car.applyBrake(0.1, deltaTime); // Simulate friction to slow down gradually
      }

      if (steeringInput !== 0) {
        car.updateSteering(steeringInput, deltaTime);
      } else {
        // Gradually return the steering angle to zero if no keys are pressed
        resetSteering(car, deltaTime);
      }

      car.updatePosition(deltaTime);
      const newCarPos = [car.getPositionX(), car.getPositionY()];

      if (!track.isCarWithinTrack(newCarPos, carRadius)) {
        resetCarToStart(); // Reset to start position and orientation if car goes off track
      } else {
        setCarPos(newCarPos);
        checkpoints.forEach((checkpoint, idx) => {
          const distanceToCheckpoint = Math.hypot(newCarPos[0] - checkpoint[0], newCarPos[1] - checkpoint[1]);
          if (distanceToCheckpoint < track.streetDiameter && idx > 0) {
            setCurrentCheckpoint(checkpoint);
          }
        });
      }
    }
  }, [keys, car, carPos, currentCheckpoint, checkpoints, track, lastTime]);



const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result);
        const loadedTrack = new Track(jsonData.streetDiameter, jsonData.track.map((point) => [point.x, point.y]));
        setTrack(loadedTrack);
        setTrackDrawnYet(true);

        // Call drawScaled after track is loaded
        resizeCanvas();
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        loadedTrack.drawScaled(ctx, scaleFactor); // Draw the track on the canvas

        handleDriveCar();

      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };
    // Handle driving the car and using the modular `createCar` function
  const handleDriveCar = () => {
    if (track.points.length > 0) {
      const initialAngle = track.getDirection();
      const car = createCar(track.points[0][0], track.points[0][1], initialAngle); // Call modularized car creation function
      setInitialCarState({ positionX: car.positionX, positionY: car.positionY, angle: car.angle });
      setCar(car);
      setCarPos(track.points[0]);
      setCurrentCheckpoint(track.points[0]);
    }
  };

  // Update key states when pressed or released
  const handleKeyDown = (event) => {
    setKeys((prevKeys) => ({ ...prevKeys, [event.key]: true }));
  };

  const handleKeyUp = (event) => {
    setKeys((prevKeys) => ({ ...prevKeys, [event.key]: false }));
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);


  // Method to resize the canvas
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
      {fileName && <p>Loaded File: {fileName}</p>}
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
