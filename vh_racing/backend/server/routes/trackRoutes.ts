import { Router, Request, Response } from 'express';
import { Track } from '../models/Track.js';
import { verifyToken } from '../middleware/auth.js';
import { JwtPayload } from 'jsonwebtoken';  // Ensure you're importing JwtPayload

const router = Router();

// Example route to load tracks
router.get('/load', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as JwtPayload)?.id;  // Safely cast req.user as JwtPayload

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    // Query tracks based on the userId
    const tracks = await Track.find({ userId });

    res.json({ tracks });
  } catch (err) {
    console.error('Error loading tracks:', (err as Error).message);  // Type 'err' as Error
    res.status(500).json({ message: 'Failed to load tracks', details: (err as Error).message });
  }
});

// Example route to save a track
router.post('/save', verifyToken, async (req: Request, res: Response) => {
  try {
    const userId = (req.user as JwtPayload)?.id;  // Safely cast req.user as JwtPayload

    if (!userId) {
      return res.status(400).json({ message: 'User ID not found' });
    }

    // Extract track data from the request
    const { trackData } = req.body;

    const newTrack = new Track({
      userId,
      trackData,
    });

    await newTrack.save();
    res.status(201).json({ message: 'Track saved successfully' });
  } catch (err) {
    console.error('Error saving track:', (err as Error).message);  // Type 'err' as Error
    res.status(500).json({ message: 'Failed to save track', details: (err as Error).message });
  }
});

export default router;
