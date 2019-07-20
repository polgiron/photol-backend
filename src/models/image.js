import mongoose from 'mongoose';
import { getSignedUrl } from '../utils/s3';

const imageSchema = new mongoose.Schema({
  title: {
    type: String
  },
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  s3Key: {
    type: String,
    required: true,
    unique: true
  },
  s3Id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String
  },
  extension: {
    type: String
  },
  oriWidth: {
    type: String
  },
  oriHeight: {
    type: String
  }
});

imageSchema.pre('save', function (next) {
  // console.log('---BEFORE CREATE IMAGE');
  // console.log(this.title);

  this.albums.forEach(albumId => {
    this.model('Album').findOneAndUpdate(
      { _id: albumId },
      { $addToSet: { 'images': this._id } },
      { safe: true, upsert: true, new: true, useFindAndModify: false },
      function (err, model) {
        // console.log(err, model);
      }
    );
  });

  next();
});

imageSchema.post('find', function (images) {
  images.forEach(image => {
    image.signedUrl = getSignedUrl(image, 'small');
  });
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
