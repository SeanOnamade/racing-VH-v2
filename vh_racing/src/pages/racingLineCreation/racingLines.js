import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import TrackList from '../../components/TrackList.tsx';
import { useNavigate } from 'react-router-dom';

// Track class definition
class Track {
  constructor(streetDiameter = 50, points = []) {
    this.points = points; // Initialize with passed points
    this.drawing = false; // Flag for drawing state
    this.streetDiameter = streetDiameter; // Diameter of the street
  }

  addPoint(pos) {
    this.points.push(pos);
  }

  closeTrack() {
    if (this.points.length) {
      this.points.push(this.points[0]); // Close the track by connecting the last point to the first
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
}

const TrackDrawingApp = () => {
  const canvasRef = useRef(null);
  const [track, setTrack] = useState(new Track());
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [reloadTracks, setReloadTracks] = useState(false); // State to trigger reloading the track list
  const [savedYet, setSavedYet] = useState(false); // Initialize savedYet
  const navigate = useNavigate(); // for navigation to /race

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas before drawing
      ctx.fillStyle = 'rgba(0, 128, 0, 0.5)'; // Slight greenish transparent background for canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx); // Draw the current track
    };

    draw();
  }, [track, mousePos, isDrawing]);

  const handleMouseDown = (event) => {
    if (!isDrawing && !trackDrawnYet) {
      setIsDrawing(true);
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];
      track.clear(); // Clear the current track when starting a new one
      track.addPoint(pos); // Add the starting point
      setTrack(new Track(track.streetDiameter)); // Reset the track state
    }
  };

  const handleMouseUp = (event) => {
    if (isDrawing) {
      setIsDrawing(false);
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];

      track.closeTrack();
      track.addPoint(pos); // Add the final point
      track.closeTrack(); // Close the track by connecting the last point to the first
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
      const scaleX = canvasRef.current.width / rect.width;
      const scaleY = canvasRef.current.height / rect.height;
  
      const pos = [
        (event.clientX - rect.left) * scaleX,
        (event.clientY - rect.top) * scaleY
      ];
  
      setMousePos(pos);
      track.addPoint(pos); // Add points as the mouse moves
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
    }
  };
  

  const saveTrack = async () => {
    if (savedYet) return; // Prevent duplicate saves
    const { filename, trackData } = track.save();
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token is missing; you are signed out');
      return;
    }

    try {
      const wrappedData = { trackData };

      await axios.post('http://localhost:5000/api/tracks/save', wrappedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Track saved to your profile!');

      const blob = new Blob([JSON.stringify(wrappedData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setSavedYet(true);
      setReloadTracks(!reloadTracks); // Trigger track list reload
    } catch (error) {
      console.error('Failed to save track:', error);
    }
  };

  const loadTrackFromDB = (event) => {
    const trackData = event.target.files[0];

    if (trackData) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);

        if (data && data.track) {
          const loadedTrack = new Track(data.streetDiameter, data.track.map(point => [point.x, point.y]));
          setTrack(loadedTrack);
          setTrackDrawnYet(true);
          setSavedYet(true);
        } else {
          console.error('Invalid track data', data);
        }
      };
      reader.readAsText(trackData);
    }
  };

  const resetTrack = () => {
    track.clear();
    setTrack(new Track(track.streetDiameter));
    setTrackDrawnYet(false);
    setSavedYet(false);
  };

  const handleValidateTrack = () => {
    // Save the track to local storage
    const { trackData } = track.save();
    localStorage.setItem('savedTrack', JSON.stringify(trackData));

    // Navigate to the race page
    navigate('/race');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center transform scale-90"
      style={{ backgroundImage: "url('/track2.jpg')" }}
    >
      <div className="flex justify-center space-x-6 gap-40 flex-row-reverse min-h-screen items-center">
        <div className='flex flex-col items-start max-h-screen overflow-auto'>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className='rounded-lg'
            style={{ border: '1px solid black', marginBottom: '20px' }}
          />
          <div className='flex gap-5 items-start'>
            <button onClick={saveTrack} style={{ ...buttonStyle}} disabled={savedYet}>
              Save Track
            </button>
            <label className="transition ease-in-out duration-150 hover:bg-slate-400" style={buttonStyle}>
              Load Track
              <input type="file" onChange={loadTrackFromDB} style={{ display: 'none' }} />
            </label>
            <button onClick={resetTrack} style={{
              backgroundColor: 'green',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              textAlign: 'center',
              paddingTop: '1.5rem',
              paddingBottom: '1.5rem',
              marginTop: '0.25rem',
              textAlign: 'center',
            }}>Reset</button>
            <button onClick={handleValidateTrack} style={buttonStyle}>Validate Track</button>
          </div>
        </div>

        <div className="flex justify-center flex-col items-center max-h-screen overflow-auto" style={{ marginTop: '20px', fontSize: '18px' }}>
          <TrackList loadTrack={loadTrackFromDB} reloadTracks={reloadTracks} />
        </div>
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
