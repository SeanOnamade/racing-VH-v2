import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });

  try {
    console.log('Token:', token);
    console.log('JWT_SECRET:', process.env.JWT_SECRET);
    const verified = jwt.verify(token, process.env.JWT_SECRET!);
    // @ts-ignore
    req.user = verified;  // Attach the verified user to the request object
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(400).json({ message: 'Invalid token' });
  }
};