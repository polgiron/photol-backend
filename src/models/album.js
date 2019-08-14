import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  rollId: {
    type: Number,
    unique: true
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
