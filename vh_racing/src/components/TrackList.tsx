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
      if (!token) {
        console.error('No token found, please log in.');
        setTracks([]); // No tracks if not logged in
        return;
      }


      try {
        const res = await axios.get('http://localhost:5000/api/tracks/load', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });


        // Ensure the response data is an array of tracks
        const trackData = Array.isArray(res.data) ? res.data : [];
        setTracks(trackData); // Set tracks or empty array
        } catch (error: any) { // better error handling!
        // Handle token expiration and other errors
        if (error.response && error.response.status === 400) {
          const errorMessage = error.response.data.message;

          if (errorMessage.includes('Invalid token')) {
            console.error('Token has expired. Please log in again.');
          } else {
            console.error('Bad request:', errorMessage);
          }
        } else {
          console.error('Failed to load tracks:', error);
        }
        setTracks([]); // Set empty array if error occurs
      }
    };


    fetchTracks();
  }, [reloadTracks]);

  const deleteTrack = async (trackId: string) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://localhost:5000/api/tracks/delete/${trackId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Remove track from the state after deletion
      setTracks(tracks.filter(track => track._id !== trackId));
    } catch (error) {
      console.error('Failed to delete track:', error);
    }
  };


  return (
    <div>
      <h3 className="text-center bg-slate-300 shadow-md rounded-lg px-2 pt-2 pb-2 mb-4 opacity-75">Your Saved Tracks</h3>
      <ul className="flex flex-col items-center">
        {/* Ensure tracks is an array before mapping */}
        {Array.isArray(tracks) && tracks.length > 0 ? (
          tracks.map(track => (
            <li key={track._id} className="flex flex-col items-center mb-4">
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <button className="text-sm bg-blue-500 text-white py-2 px-4 rounded-lg transition ease-in-out opacity-90 duration-150 hover:bg-slate-400" onClick={() => loadTrack(track.trackData)}>
                        Load Track #{track._id}
                    </button>
                    <button
                        className="text-sm bg-red-500 text-white py-2 mb-2 px-4 ml-2 rounded-lg transition ease-in-out opacity-90 duration-150 hover:bg-red-600"
                        onClick={() => deleteTrack(track._id)}
                    >
                        Delete
                    </button>
                </div>
            </li>
          ))
        ) : (
          <p style={{ color: 'white'}}>No tracks available</p>
        )}
      </ul>
    </div>
  );
};


export default TrackList;