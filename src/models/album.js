import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }]
});

const Album = mongoose.model('Album', albumSchema);

export default Album;
