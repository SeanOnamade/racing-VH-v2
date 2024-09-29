import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import dotenv from 'dotenv';
import trackRoutes from './routes/trackRoutes.js'; // Import track routes

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tracks', trackRoutes); // Mount the track routes

mongoose.connect(process.env.MONGO_URI!)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error(err));

export default app;
