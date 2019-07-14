import mongoose from 'mongoose';
import S3 from '../utils/s3';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  s3_key: {
    type: String,
    required: true
  },
  s3_id: {
    type: String,
    required: true
  },
  type: {
    type: String
  },
  original_width: {
    type: String
  },
  original_height: {
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
  // console.log('Before find image');

  images.forEach(image => {
    // console.log('----');
    // console.log('image title: ' + image.title);
    // console.log('image s3 key: ' + image.s3_key);

    const signedUrl = S3.getSignedUrl('getObject', {
      // Bucket: process.env.S3_BUCKET,
      Key: image.s3_key,
      Expires: 300 // 5 minutes
    });

    image.signed_url = signedUrl;
  });
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
