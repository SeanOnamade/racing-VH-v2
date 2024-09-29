import React, { useRef, useState, useEffect } from 'react';
import { Car, MassCategory, TireType } from '../../components/Car.js';
import Track from '../../components/Track.js';

/**
 * @definition createCar
 * @params x, y, angle
 * @returns Car object
 * Creates a new car with the specified position and angle.
 */
const createCar = (x, y, angle) => {
  const car = new Car(MassCategory.Medium, TireType.Slick, x, y);
  car.angle = angle;
  return car;
};

/**
 * @definition ValidTrack
 * @params None
 * @returns JSX.Element
 * React component for drawing and interacting with a racing track and car using WASD controls.
 */
const ValidTrack = () => {
  const [fileName, setFileName] = useState('');
  const canvasRef = useRef(null);
  const originalWidth = 853;
  const originalHeight = 600;
  const scaleFactor = 2;

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
  const [overlayImage, setOverlayImage] = useState(null);
  const [carSpeed, setCarSpeed] = useState(0); // State to track car speed

  const carRadius = track.streetDiameter / 4;

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Loads the car image from the public folder when the component mounts.
   */
  useEffect(() => {
    const img = new Image();
    img.src = "/car.png";
    img.onload = () => setCarImage(img);
  }, []);

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Loads the overlay image from the public folder when the component mounts.
   */
  useEffect(() => {
    const img = new Image();
    img.src = "/wasd.png";
    img.onload = () => setOverlayImage(img);
  }, []);

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Loads the track from localStorage when the component mounts.
   */
  useEffect(() => {
    const savedTrack = localStorage.getItem('savedTrack');
    if (savedTrack) {
      const trackData = JSON.parse(savedTrack);
      const loadedTrack = new Track(trackData.streetDiameter, trackData.track.map(({ x, y }) => [x, y]));
      setTrack(loadedTrack);
      setTrackDrawnYet(true);
    }
  }, []);

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Adds event listeners for keydown and keyup to capture car control inputs.
   */
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

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Updates the car's position and physics based on key inputs.
   */
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

      setCarSpeed(car.getVelocity().toFixed(2)); // Update the car's speed

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

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Draws the track and car on the canvas.
   */
  useEffect(() => {
    if (trackDrawnYet && carImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizeCanvas();

        const translationX = car ? -car.positionX + initialCarState.positionX : 0;
        const translationY = car ? -car.positionY + initialCarState.positionY : 0;

        ctx.save();
        ctx.scale(scaleFactor, scaleFactor);
        ctx.translate(translationX, translationY);

        ctx.lineWidth = 80;
        track.drawScaled(ctx, 1);

        if (car && carPos) {
          const carWidth = 30 * (scaleFactor * 0.8);
          const carHeight = 20 * (scaleFactor * 0.8);
          ctx.save();
          ctx.translate(carPos[0], carPos[1]);
          ctx.rotate(car.angle);
          ctx.drawImage(carImage, -carWidth / 2, -carHeight / 2, carWidth, carHeight);
          ctx.restore();
        }

        ctx.restore();

        if (overlayImage) {
          const overlayWidth = 100;
          const overlayHeight = 100;
          ctx.save();
          ctx.translate(-carPos[0], -carPos[1]);
          ctx.drawImage(overlayImage, 0, canvas.height - overlayHeight, overlayWidth, overlayHeight);
          ctx.restore();
        }
      };

      draw();
    }
  }, [track, carPos, carImage, trackDrawnYet, car, carSpeed]);

  /**
   * @definition resetSteering
   * @params car, deltaTime
   * @returns None
   * Resets the car's steering angle to zero when no keys are pressed.
   */
  const resetSteering = (car, deltaTime) => {
    if (car.steeringAngle > 0) {
      car.updateSteering(-0.2, deltaTime);
    } else if (car.steeringAngle < 0) {
      car.updateSteering(0.2, deltaTime);
    }
  };

  /**
   * @definition resetCarToStart
   * @params None
   * @returns None
   * Resets the car to its initial spawn position and orientation.
   */
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

  /**
   * @definition handleDriveCar
   * @params None
   * @returns None
   * Starts driving the car after the track is fully loaded.
   */
  const handleDriveCar = () => {
    if (track.points.length > 1) {
      const startingPoint = track.points[0];
      const nextPoint = track.points[1];

      const dx = nextPoint[0] - startingPoint[0];
      const dy = nextPoint[1] - startingPoint[1];

      const trackDirection = Math.atan2(dy, dx);

      const scaledX = startingPoint[0];
      const scaledY = startingPoint[1];

      const car = createCar(scaledX, scaledY, trackDirection);
      setInitialCarState({ positionX: car.positionX, positionY: car.positionY, angle: car.angle });
      setCar(car);
      setCarPos([scaledX, scaledY]);
    }
  };

  /**
   * @definition loadTrack
   * @params event
   * @returns None
   * Loads the track from the selected file.
   */
  const loadTrack = (event) => {
    const file = event.target.files[0];

    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);

        let loadedTrack;
        if (data && data.track) {
          loadedTrack = new Track(data.streetDiameter, data.track.map((point) => [point.x, point.y]));
        } else if (data && data.trackData && data.trackData.track) {
          loadedTrack = new Track(data.trackData.streetDiameter, data.trackData.track.map((point) => [point.x, point.y]));
        } else {
          console.error('Invalid track data', data);
          return;
        }

        setTrack(loadedTrack);
        setTrackDrawnYet(false);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        resizeCanvas();
        loadedTrack.drawScaled(ctx, 1);

        setTimeout(() => {
          setTrackDrawnYet(true);
        }, 0);
      };
      reader.readAsText(file);
      event.target.value = null;
    }
  };

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Drives the car once the track is drawn.
   */
  useEffect(() => {
    if (trackDrawnYet) {
      handleDriveCar();
    }
  }, [trackDrawnYet]);

  /**
   * @definition resizeCanvas
   * @params None
   * @returns None
   * Resizes the canvas according to the original dimensions and scale factor.
   */
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = originalWidth * scaleFactor;
    canvas.height = originalHeight * scaleFactor;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgb(4, 112, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0', position: 'relative' }}>
      {/* Legend for controls and speed */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: '10px',
        borderRadius: '5px',
        color: 'white',
        fontSize: '14px',
      }}>
        <p>W - Accelerate Forward</p>
        <p>A - Turn Left</p>
        <p>S - Slow Down</p>
        <p>D - Turn Right</p>
        <p>Speed: {carSpeed} m/s</p>
      </div>

      <canvas
        ref={canvasRef}
        width={originalWidth}
        height={originalHeight}
        style={{ border: '1px solid black', marginBottom: '20px', display: 'block' }}
      />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <label style={buttonStyle}>
          Load Track
          <input type="file" accept=".json" onChange={loadTrack} style={{ display: 'none' }} />
        </label>
        <span style={{ marginLeft: '10px', fontSize: '16px', color: 'black' }}>
          Use WASD to Control!
        </span>
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

// finished
export default ValidTrack;
