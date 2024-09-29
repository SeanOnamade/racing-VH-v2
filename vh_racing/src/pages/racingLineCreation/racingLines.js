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

  getPointsCount() {
    return this.points.length;
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
  const navigate = useNavigate();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.fillStyle = 'rgb(4, 112, 0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx);
    };

    draw();
  }, [track, mousePos, isDrawing]);

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
      track.closeTrack();
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
      track.addPoint(pos);
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
    }
  };
  

  const saveTrack = async () => {
    if (savedYet) return;
    const { filename, trackData } = track.save();
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('Token is missing; you are signed out');
      return;
    }
    else {
      console.log('Token is present!');
    }

    console.log('Token:', token);

    try {
      const wrappedData = {
        trackData: trackData,
      };

      await axios.post('http://localhost:5000/api/tracks/save', wrappedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert('Track saved to your profile!');

      const blob = new Blob([JSON.stringify(wrappedData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
      setSavedYet(true);
      setReloadTracks(!reloadTracks);
    } catch (error) {
      console.error('Failed to save track:', error);
    }
  };

  const loadTrackFromDB = (event) => {
    const trackData = event.target.files[0];

    if (trackData && trackData.track) {
      const loadedTrack = new Track(
        trackData.streetDiameter || 20,
        trackData.track.map(point => [point.x, point.y])
      );
      setTrack(loadedTrack);
      setTrackDrawnYet(true);
    } else if (trackData && trackData.trackData && trackData.trackData.track) {
      const loadedTrack = new Track(
        trackData.trackData.streetDiameter || 20,
        trackData.trackData.track.map(point => [point.x, point.y])
      );
      setTrack(loadedTrack);
      setTrackDrawnYet(true);
    } else {
      console.error('Invalid track data', trackData);
    }
  };

  const loadTrackFromFile = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = JSON.parse(e.target.result);

        if (data && data.track) {
          const loadedTrack = new Track(data.streetDiameter, data.track.map(point => [point.x, point.y]));
          setTrack(loadedTrack);
          setTrackDrawnYet(true);
          setSavedYet(true);
        } else if (data && data.trackData && data.trackData.track) {
          const loadedTrack = new Track(data.trackData.streetDiameter, data.trackData.track.map(point => [point.x, point.y]));
          setTrack(loadedTrack);
          setTrackDrawnYet(true);
          setSavedYet(true);
        } else {
          console.error('Invalid track data', data);
        }

        event.target.value = null;
      };

      reader.readAsText(file);
    }
  };

  const resetTrack = () => {
    track.clear();
    setTrack(new Track(track.streetDiameter));
    setTrackDrawnYet(false);
    setSavedYet(false);
  };

  const handleValidateTrack = () => {
    saveTrack();
    navigate('/race');
  };

  return (
    <div className='transform scale-90'>
      <div className="flex justify-center space-x-6 gap-40 flex-row-reverse min-h-screen items-center">
        <div className='flex flex-col items-start max-h-screen overflow-auto '>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp} // Ensure mouse up event is handled
            className='rounded-lg'
            style={{ border: '1px solid black', marginBottom: '20px' }}
          />
          <div className='flex gap-5 items-start'>
            <button onClick={saveTrack} style={{ ...buttonStyle, opacity: savedYet ? 0.5 : 1 }} disabled={savedYet}>
              Save Track
            </button>
            <label style={buttonStyle}>
              Load Track
              <input type="file" onChange={loadTrackFromFile} style={{ display: 'none' }} />
            </label>
            <button onClick={resetTrack} style={buttonStyle}>Reset</button>
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
