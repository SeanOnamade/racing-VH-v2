import express from 'express';
import { Track } from '../models/Track.js'; // Import the Track model
import { verifyToken } from '../middleware/auth.js'; // JWT middleware to verify token


const router = express.Router();


// Route to save a new track
router.post('/save', verifyToken, async (req, res) => {
  const { trackData } = req.body;
  const userId = req.user; // req.user is now typed properly
  console.log('Saving track for user ID:', userId);
  console.log('Track data:', trackData);


  if (!trackData) {
    return res.status(400).json({ error: 'No track data provided' });
  }


  try {
    const newTrack = new Track({ userId, trackData });
    if (!trackData) {
        console.log("No trackData!")
    }
    else {
        console.log("trackdata here!")
    }
    await newTrack.save();
    res.status(201).json({ message: 'Track saved successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save track' });
  }
});


// Route to load all saved tracks for a user
router.get('/load', verifyToken, async (req, res) => {
    const userId = req.user;  // req.user is now just the userId
  
    try {
      const tracks = await Track.find({ userId });
      res.json(tracks);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching tracks for user:', userId, error.message);
        res.status(500).json({ error: 'Failed to load tracks', details: error.message });
      } else {
        console.error('Unknown error occurred:', error);
        res.status(500).json({ error: 'Failed to load tracks' });
      }
    }
  });

  router.delete('/delete/:id', verifyToken, async (req, res) => {
    try {
      const trackId = req.params.id;
      const userId = req.user;
  
      const deletedTrack = await Track.findOneAndDelete({ _id: trackId, userId });
      if (!deletedTrack) {
        return res.status(404).json({ message: 'Track not found or unauthorized' });
      }
  
      res.status(200).json({ message: 'Track deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete track' });
    }
  });

  


export default router;