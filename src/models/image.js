import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  albums: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  }],
  url_o: {
    type: String,
    // required: true,
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

const Image = mongoose.model('Image', imageSchema);

export default Image;
