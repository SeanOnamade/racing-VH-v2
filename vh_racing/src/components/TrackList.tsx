import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define a Track type with _id and trackData fields
interface Track {
  _id: string;
  trackData: any; // Adjust the type of trackData based on the structure of your saved track
}

// Define the props interface for the component
interface TracklistProps {
  loadTrack: (trackData: any) => void;
  reloadTracks: boolean;
}

const TrackList: React.FC<TracklistProps> = ({ loadTrack, reloadTracks }) => {
  const [tracks, setTracks] = useState<Track[]>([]); // Use the Track type

  useEffect(() => {
    const fetchTracks = async () => {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:5000/api/tracks/load', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTracks(res.data); // Set the tracks to the fetched data
      } catch (error) {
        console.error('Failed to load tracks:', error);
      }
    };

    fetchTracks();
  }, [reloadTracks]);

  return (
    <div>
      <h3>Your Saved Tracks</h3>
      <ul>
        {tracks.map(track => (
          <li key={track._id}>
            <button onClick={() => loadTrack({ target: { files: [track.trackData] } })}>
              Load Track #{track._id}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TrackList;
