import React, { useRef, useState, useEffect } from 'react';
import { Car, MassCategory, TireType } from '../../components/Car.js';

// Track class definition
class Track {
  constructor(streetDiameter = 40, points = []) {
    this.points = points;
    this.drawing = false;
    this.streetDiameter = streetDiameter;
  }

  addPoint(pos) {
    this.points.push(pos);
  }

  closeTrack() {
    if (this.points.length) {
      this.points.push(this.points[0]);
    }
  }

  save() {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const filename = `track_${randomNumber}.json`;
    const trackData = {
      track: this.points.map(([x, y]) => ({ x, y })),
      streetDiameter: this.streetDiameter,
    };
    return { filename, trackData };
  }

  load(data) {
    this.points = data.track.map(point => [point.x, point.y]);
    this.streetDiameter = data.streetDiameter || 10;
  }

  clear() {
    this.points = [];
    this.drawing = false;
  }

  draw(ctx) {
    const colors = ['grey', 'black'];
    const widths = [this.streetDiameter + 10, this.streetDiameter];

    if (this.points.length > 1) {
      for (let i = 0; i < colors.length; i++) {
        ctx.strokeStyle = colors[i];
        ctx.lineWidth = widths[i];

        ctx.beginPath();
        ctx.moveTo(this.points[0][0], this.points[0][1]);
        for (let j = 1; j < this.points.length; j++) {
          ctx.lineTo(this.points[j][0], this.points[j][1]);
        }
        ctx.stroke();

        ctx.fillStyle = colors[i];
        for (const point of this.points) {
          ctx.beginPath();
          ctx.arc(point[0], point[1], widths[i] / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  getDirection() {
    if (this.points.length > 1) {
      const [x1, y1] = this.points[0];
      const [x2, y2] = this.points[1];
      const angle = Math.atan2(y2 - y1, x2 - x1);
      return angle;
    }
    return 0; // Default to no angle if insufficient points
  }

  getCheckpoints() {
    const numCheckpoints = 4;
    const checkpointInterval = Math.floor(this.points.length / numCheckpoints);
    let checkpoints = [];
    for (let i = 0; i < numCheckpoints; i++) {
      checkpoints.push(this.points[i * checkpointInterval]);
    }
    return checkpoints;
  }

  isCarWithinTrack(carPos, carWidth) {
    const margin = this.streetDiameter / 2;
    for (let i = 0; i < this.points.length - 1; i++) {
      const [x1, y1] = this.points[i];
      const [x2, y2] = this.points[i + 1];

      if (
        carPos[0] > Math.min(x1, x2) - margin &&
        carPos[0] < Math.max(x1, x2) + margin &&
        carPos[1] > Math.min(y1, y2) - margin &&
        carPos[1] < Math.max(y1, y2) + margin
      ) {
        return true;
      }
    }
    return false;
  }
}

// Modular car creation function
const createCar = (x, y, angle) => {
  const car = new Car(MassCategory.Medium, TireType.Slick, x, y);
  car.angle = angle;
  return car;
};

// React Component for the track drawing application
const CarTest = () => {
  const canvasRef = useRef(null);
  const [track, setTrack] = useState(new Track());
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [showDriveButton, setShowDriveButton] = useState(false);
  const [car, setCar] = useState(null); // Initialize car object
  const [carPos, setCarPos] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const [carImage, setCarImage] = useState(null); // State for the car image
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

  // Draw the car and track
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.fillStyle = 'rgb(4, 112, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx);

      if (carPos && carImage && car) {
        const carWidth = carRadius * 4;
        const carHeight = carRadius * 3;
        ctx.save();
        ctx.translate(carPos[0], carPos[1]);
        ctx.rotate(car.angle); // Car's angle in radians
        ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
        ctx.restore();
      }
    };

    draw();
  }, [track, mousePos, isDrawing, carPos, carRadius, carImage, car]);

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
    if (car && initialCarState) {
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

  const handleMouseUp = () => {
    setIsDrawing(false);
    track.closeTrack();
    setTrackDrawnYet(true);
    setShowDriveButton(true);
  };

  const handleMouseMove = (event) => {
    if (isDrawing && !trackDrawnYet) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];
      setMousePos(pos);
      track.addPoint(pos);
    }
  };

  const saveTrack = () => {
    const { filename, trackData } = track.save();
    const blob = new Blob([JSON.stringify(trackData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const loadTrack = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);
        const loadedTrack = new Track(data.streetDiameter, data.track.map((point) => [point.x, point.y]));
        setTrack(loadedTrack);
        setTrackDrawnYet(true);
        setShowDriveButton(true);
        setCheckpoints(loadedTrack.getCheckpoints());
        setCurrentCheckpoint(loadedTrack.points[0]);
      };
      reader.readAsText(file);
    }
  };

  const resetTrack = () => {
    track.clear();
    setTrack(new Track(track.streetDiameter));
    setTrackDrawnYet(false);
    setShowDriveButton(false);
    setCarPos(null);
    setCurrentCheckpoint(null);
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        backgroundImage: 'url("/snow2.jpg")',
        backgroundSize: 'contain', 
        backgroundRepeat: 'no-repeat', 
        backgroundPosition: 'center', 
        minHeight: '100vh',
        backgroundAttachment: 'fixed',
      }}
    >
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ border: '2px solid black', marginBottom: '20px', opacity: 1 }}
      />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button onClick={saveTrack} style={buttonStyle}>
          Save Track
        </button>
        <label style={buttonStyle}>
          Load Track
          <input type="file" onChange={loadTrack} style={{ display: 'none' }} />
        </label>
        <button onClick={resetTrack} style={buttonStyle}>
          Reset
        </button>
        {showDriveButton && (
          <button onClick={handleDriveCar} style={buttonStyle}>
            Drive Car
          </button>
        )}
      </div>
    </div>
  );
};

// Button style
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

export default CarTest;
