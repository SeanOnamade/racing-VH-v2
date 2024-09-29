import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload; // Explicitly casting to JwtPayload

    // If the payload doesn't contain an id, return an error
    if (!verified || !verified.id) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    // Attach only the user id to the request object
    req.user = { id: verified.id };

    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(400).json({ message: 'Invalid token' });
  }
};
