import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


// Middleware to verify JWT token
// Middleware to verify JWT token
export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');


  if (!token) return res.status(401).json({ message: 'Access Denied. No token provided.' });


  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = (verified as jwt.JwtPayload).id; // Set only the id from the token payload
    next();
  } catch (err: any) { // this section handles if the token expires lol
    if (err.name === 'TokenExpiredError') {
      console.error('Token expired:', err);
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    console.error('Token verification failed:', err);
    res.status(400).json({ message: 'Invalid token' });
  }
};
