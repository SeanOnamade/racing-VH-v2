import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import TrackList from '../../components/TrackList.tsx';
import { useNavigate } from 'react-router-dom';

/**
 * @definition Track
 * @params streetDiameter, points
 * @returns Track object
 * Track class representing a track that can be drawn, saved, and manipulated.
 */
class Track {
  constructor(streetDiameter = 50, points = []) {
    this.points = points;
    this.drawing = false;
    this.streetDiameter = streetDiameter;
  }

  /**
   * @definition addPoint
   * @params pos
   * @returns None
   * Adds a point to the track.
   */
  addPoint(pos) {
    this.points.push(pos);
  }

  /**
   * @definition closeTrack
   * @params None
   * @returns None
   * Closes the track by connecting the last point to the first.
   */
  closeTrack() {
    if (this.points.length) {
      this.points.push(this.points[0]);
    }
  }

  /**
   * @definition save
   * @params None
   * @returns Object
   * Saves the track to a JSON object with a randomly generated filename.
   */
  save() {
    const randomNumber = Math.floor(Math.random() * 9000) + 1000;
    const filename = `track_${randomNumber}.json`;
    const trackData = {
      track: this.points.map(([x, y]) => ({ x, y })),
      streetDiameter: this.streetDiameter,
    };
    return { filename, trackData };
  }

  /**
   * @definition load
   * @params data
   * @returns None
   * Loads a track from the provided data.
   */
  load(data) {
    this.points = data.track.map(point => [point.x, point.y]);
    this.streetDiameter = data.streetDiameter || 10;
  }

  /**
   * @definition clear
   * @params None
   * @returns None
   * Clears all points and resets the drawing state.
   */
  clear() {
    this.points = [];
    this.drawing = false;
  }

  /**
   * @definition draw
   * @params ctx
   * @returns None
   * Draws the track on the given canvas context.
   */
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

/**
 * @definition TrackDrawingApp
 * @params None
 * @returns JSX.Element
 * React component for drawing, saving, and managing tracks.
 */
const TrackDrawingApp = () => {
  const canvasRef = useRef(null);
  const [track, setTrack] = useState(new Track());
  const [isDrawing, setIsDrawing] = useState(false);
  const [mousePos, setMousePos] = useState([0, 0]);
  const [trackDrawnYet, setTrackDrawnYet] = useState(false);
  const [reloadTracks, setReloadTracks] = useState(false);
  const [savedYet, setSavedYet] = useState(false);
  const navigate = useNavigate();

  /**
   * @definition useEffect
   * @params None
   * @returns None
   * Initializes the drawing on the canvas based on track state and mouse position.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(0, 128, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      track.draw(ctx);
    };

    draw();
  }, [track, mousePos, isDrawing]);

  /**
   * @definition handleMouseDown
   * @params event
   * @returns None
   * Handles mouse down events for starting the drawing of the track.
   */
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

  /**
   * @definition handleMouseUp
   * @params event
   * @returns None
   * Handles mouse up events for completing the drawing of the track.
   */
  const handleMouseUp = (event) => {
    if (isDrawing) {
      setIsDrawing(false);
      const rect = canvasRef.current.getBoundingClientRect();
      const pos = [event.clientX - rect.left, event.clientY - rect.top];

      track.closeTrack();
      track.closeTrack(); // Close the track by connecting the last point to the first
      setTrackDrawnYet(true);
      setTrack(prevTrack => {
        const updatedTrack = new Track(prevTrack.streetDiameter);
        updatedTrack.points = [...prevTrack.points];
        return updatedTrack;
      });
    }
  };

  /**
   * @definition handleMouseMove
   * @params event
   * @returns None
   * Handles mouse move events for updating the track as the user moves the mouse.
   */
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

  /**
   * @definition saveTrack
   * @params None
   * @returns None
   * Saves the drawn track to a file and backend.
   */
  const saveTrack = async () => {
    if (savedYet) return;
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
      setReloadTracks(!reloadTracks);
    } catch (error) {
      console.error('Failed to save track:', error);
    }
  };

  /**
   * @definition loadTrackFromDB
   * @params event
   * @returns None
   * Loads a track from the selected file.
   */
  const loadTrackFromDB = (trackData) => {
    if (!trackData) {
      console.error('No track data provided');
      return;
    }
  
    try {
      // Check if trackData is in old or new format
      if (trackData && trackData.track) {
        // Old format
        console.log('Loaded trackData from DB (old format):', trackData);
        const loadedTrack = new Track(
          trackData.streetDiameter || 20, // Default streetDiameter if not provided
          trackData.track.map(point => [point.x, point.y]) // Map track points
        );
        setTrack(loadedTrack);
        setTrackDrawnYet(true);
        setSavedYet(true);
      } else if (trackData && trackData.trackData && trackData.trackData.track) {
        // New format
        console.log('Loaded trackData from DB (new format):', trackData);
        const loadedTrack = new Track(
          trackData.trackData.streetDiameter || 20,
          trackData.trackData.track.map(point => [point.x, point.y])
        );
        setTrack(loadedTrack);
        setTrackDrawnYet(true);
        setSavedYet(true);
      } else {
        console.error('Invalid track data', trackData);
      }
    } catch (error) {
      console.error('Failed to load track data:', error);
    }
  };
  

  const loadTrackFromFile = (event) => {
    const file = event.target.files[0];
  
    if (!file) {
      console.error("No file selected");
      return;
    }
    console.log("Uploading track!");
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const trackData = JSON.parse(e.target.result);
        loadTrackFromDB(trackData); // Reuse the loadTrackFromDB function
      } catch (error) {
        console.error('Failed to parse track data:', error);
      }
    };
  
    reader.onerror = () => {
      console.error("Error reading file");
    };
  
    reader.readAsText(file);
  };
  
  

  /**
   * @definition resetTrack
   * @params None
   * @returns None
   * Resets the track to a blank state.
   */
  const resetTrack = () => {
    track.clear();
    setTrack(new Track(track.streetDiameter));
    setTrackDrawnYet(false);
    setSavedYet(false);
  };

  /**
   * @definition handleValidateTrack
   * @params None
   * @returns None
   * Saves the track and navigates to the race page.
   */
  const handleValidateTrack = () => {
    const { trackData } = track.save();
    localStorage.setItem('savedTrack', JSON.stringify(trackData));

    navigate('/race');
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/track2.jpg')" }}
    >
      <div className="flex justify-center space-x-6 gap-40 flex-row-reverse min-h-screen items-center transform scale-90">
        <div className='flex flex-col items-start max-h-screen overflow-x-hidden opacity-100'>
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className='rounded-lg'
            style={{ marginBottom: '20px', opacity: '1' }}
          />
          <div className='flex gap-5 items-start'>
            <button className="hover:opacity-75" onClick={saveTrack} style={{ ...buttonStyle}} disabled={savedYet}>
              Save Track
            </button>
            <label className="transition ease-in-out duration-150 hover:opacity-75" style={buttonStyle}>
              Load Track
              <input type="file" onChange={loadTrackFromFile} style={{ display: 'none' }} />
            </label>
            <button className="hover:opacity-75" onClick={resetTrack} style={{
              backgroundColor: 'green',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
              textAlign: 'center',
              paddingTop: '1.25rem',
              paddingBottom: '1.25rem',
              marginTop: '0.25rem',
            }}>Reset</button>
            <button className="hover:opacity-75" onClick={handleValidateTrack} style={buttonStyle}>Validate Track</button>
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
