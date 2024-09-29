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
  const scaleFactor = 4; // Change this value to scale everything

  // CAR STUFF
  const [track, setTrack] = useState(new Track());
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [car, setCar] = useState(null);
  const [carPos, setCarPos] = useState([null]);
  const [carImage, setCarImage] = useState(null);
  const [initialCarState, setInitialCarState] = useState(null);
  const [keys, setKeys] = useState({ W: false, S: false, A: false, D: false });
  const [lastTime, setLastTime] = useState(performance.now());
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);

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
      const key = event.key.toUpperCase();
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

  useEffect(() => {
    const now = performance.now();
    const deltaTime = (now - lastTime) / 1000;
    setLastTime(now);

    if (car) {
      let throttle = keys.W ? 0.5 : 0;
      let brake = keys.S ? 0.5 : 0;
      let steeringInput = keys.A ? -0.5 : keys.D ? 0.5 : 0;

      if (throttle > 0) {
        car.applyThrottle(throttle, deltaTime);
      } else if (!keys.E && !keys.S) {
        car.applyThrottle(0, deltaTime);
      }

      if (brake > 0) {
        car.applyBrake(brake, deltaTime);
      } else if (!keys.W && !keys.S) {
        car.applyBrake(0.1, deltaTime);
      }

      if (steeringInput !== 0) {
        car.updateSteering(steeringInput, deltaTime);
      } else {
        resetSteering(car, deltaTime);
      }

      car.updatePosition(deltaTime);
      const newCarPos = [car.getPositionX(), car.getPositionY()];

      if (!track.isCarWithinTrack(newCarPos, carRadius)) {
        resetCarToStart();
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

  // Draw the track and car
  useEffect(() => {
    if (trackDrawnYet && carImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizeCanvas();

        // Calculate the translation vector
        const translationX = car ? -car.positionX + initialCarState.positionX : 0;
        const translationY = car ? -car.positionY + initialCarState.positionY : 0;


        // Apply scaling
        ctx.save();
        ctx.scale(scaleFactor, scaleFactor); // Scale everything
        ctx.translate(translationX, translationY); // Translate to keep car in position

        // Draw the track with a thicker stroke
        ctx.lineWidth = 80; // Adjust this value to make the track thicker
        track.drawScaled(ctx, 1); // Draw track without scaling since it's already scaled

        // Draw the car only if it exists
        if (car && carPos) {
          const carWidth = 30; // Use original dimensions
          const carHeight = 20; // Use original dimensions
          ctx.save();
          ctx.translate(carPos[0], carPos[1]);
          ctx.rotate(car.angle);
          ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
          ctx.restore();
        }

        ctx.restore(); // Restore the context after scaling
      };

      draw();
    }
  }, [track, carPos, carImage, trackDrawnYet, car]);

  // Handle steering reset to zero when no keys are pressed
  const resetSteering = (car, deltaTime) => {
    if (car.steeringAngle > 0) {
      car.updateSteering(-0.2, deltaTime);
    } else if (car.steeringAngle < 0) {
      car.updateSteering(0.2, deltaTime);
    }
  };

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
    if (track.points.length > 1) {
      const startingPoint = track.points[0];
      const nextPoint = track.points[1];

      const dx = nextPoint[0] - startingPoint[0];
      const dy = nextPoint[1] - startingPoint[1];

      const trackDirection = Math.atan2(dy, dx);

      const scaledX = startingPoint[0]; // Use original dimensions
      const scaledY = startingPoint[1]; // Use original dimensions

      const car = createCar(scaledX, scaledY, trackDirection);
      setInitialCarState({ positionX: car.positionX, positionY: car.positionY, angle: car.angle });
      setCar(car);
      setCarPos([scaledX, scaledY]);
    }
  };

  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const jsonData = JSON.parse(e.target.result);
        const loadedTrack = new Track(jsonData.streetDiameter, jsonData.track.map((point) => [point.x, point.y]));
        setTrack(loadedTrack);

        setTrackDrawnYet(false);
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        resizeCanvas();
        loadedTrack.drawScaled(ctx, 1); // Draw track without scaling since it's already scaled

        setTimeout(() => {
          setTrackDrawnYet(true);
        }, 0);
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };

  useEffect(() => {
    if (trackDrawnYet) {
      handleDriveCar();
    }
  }, [trackDrawnYet]);

  // Resize the canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = originalWidth*scaleFactor;
    canvas.height = originalHeight*scaleFactor;

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
