import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
