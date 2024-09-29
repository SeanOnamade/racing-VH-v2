import React, { useRef, useState, useEffect } from 'react';

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

// React Component for the track drawing application
const CarTest = () => {
  const canvasRef = useRef(null);
  const [track, setTrack] = useState(new Track());
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [showDriveButton, setShowDriveButton] = useState(false);
  const [carPos, setCarPos] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState(null);
  const carRadius = track.streetDiameter / 4;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.fillStyle = 'rgb(4, 112, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx);

      // Draw the car if a position is set
      if (carPos) {
        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.arc(carPos[0], carPos[1], carRadius, 0, Math.PI * 2); // Draw the car as a circle
        ctx.fill();
      }
    };

    draw();
  }, [track, mousePos, isDrawing, carPos, carRadius]);

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
      setShowDriveButton(true);
      setTrack((prevTrack) => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        setCheckpoints(updatedTrack.getCheckpoints());
        setCurrentCheckpoint(updatedTrack.points[0]); // Ensure car spawns at the first checkpoint
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
      setTrack((prevTrack) => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
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

  const handleDriveCar = () => {
    if (track.points.length > 0) {
      setCarPos(track.points[0]); // Set car at the first point (first checkpoint)
      setCurrentCheckpoint(track.points[0]);
    }
  };

  // Capture key events and send control signals to Flask backend
  useEffect(() => {
    const handleKeyDown = (event) => {
      let throttle = 0;
      let brake = 0;
      let steeringInput = 0;
      const deltaTime = 1.0;

      if (event.key === 'ArrowUp') {
        throttle = 1.0;
      } else if (event.key === 'ArrowDown') {
        brake = 1.0;
      } else if (event.key === 'ArrowLeft') {
        steeringInput = -1.0;
      } else if (event.key === 'ArrowRight') {
        steeringInput = 1.0;
      }

      // Send the control data to Flask backend
      const sendCarState = (action, data) => {
        fetch(`http://127.0.0.1:5000/api/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
          .then((response) => response.json())
          .then((data) => {
            console.log('API response:', data);
            const newCarPos = [data.positionX, data.positionY];

            if (!track.isCarWithinTrack(newCarPos, carRadius)) {
              // If car is outside the track, reset to last checkpoint
              setCarPos(currentCheckpoint);
            } else {
              setCarPos(newCarPos);

              // Check if we have passed a checkpoint
              checkpoints.forEach((checkpoint, idx) => {
                const distanceToCheckpoint = Math.hypot(newCarPos[0] - checkpoint[0], newCarPos[1] - checkpoint[1]);
                if (distanceToCheckpoint < track.streetDiameter && idx > 0) {
                  setCurrentCheckpoint(checkpoint);
                }
              });
            }
          })
          .catch((err) => {
            console.error('API request failed:', err);
          });
      };

      if (throttle > 0) {
        sendCarState('apply_throttle', { throttle, deltaTime });
      }

      if (brake > 0) {
        sendCarState('apply_brake', { brake, deltaTime });
      }

      if (steeringInput !== 0) {
        sendCarState('update_steering', { steeringInput, deltaTime });
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [carPos, currentCheckpoint, checkpoints, track]);

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