import mongoose from 'mongoose';

const TrackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trackData: {
    track: [
      {
        x: { type: Number, required: true },
        y: { type: Number, required: true },
      }
    ],
    streetDiameter: { type: Number, required: true },  // Storing the JSON data of the track
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Track = mongoose.model('Track', TrackSchema);
