import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  rollId: {
    type: Number
  },
  date: {
    type: Number
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }],
  cover: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }
});

const Album = mongoose.model('Album', albumSchema);

export default Album;
