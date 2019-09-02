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
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag'
  }],
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
    type: Number
  },
  oriHeight: {
    type: Number
  },
  ratio: {
    type: Number
  },
  favorite: {
    type: Boolean
  },
  date: {
    type: Number
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

// imageSchema.pre('remove', function (next) {
//   console.log('PRE REMOVE IMAGE');
// //   const image = this;

// //   deleteFromS3(`ori/${image.s3Id}.${image.extension}`);
// //   // deleteFromS3(`thumb/${image.s3Id}_${thumbPath}.${image.extension}`);

// //   // image.model('Album').update(
// //   //   { images: { $in: image.albums } },
// //   //   { $pull: { image: image._id } },
// //   //   { multi: true },
// //   //   next
// //   // );
// });

const Image = mongoose.model('Image', imageSchema);

export default Image;
