import mongoose from 'mongoose';
import S3 from '../utils/s3';

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
  // console.log('Before find image');

  images.forEach(image => {
    // console.log('----');
    // console.log('image title: ' + image.title);
    // console.log('image s3 key: ' + image.s3Key);

    const smallThumbKey = `thumb/${image.s3Id}_${process.env.SMALL_THUMB_SIZE}.${image.extension}`;

    const signedUrl = S3.getSignedUrl('getObject', {
      // Bucket: process.env.S3_BUCKET,
      // Key: image.s3Key,
      Key: smallThumbKey,
      Expires: 300 // 5 minutes
    });

    // console.log('signedUrl', signedUrl);

    image.signedUrl = signedUrl;
  });
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
