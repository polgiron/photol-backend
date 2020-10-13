import mongoose from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

const imageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  date: {
    type: Number
  },
  stars: {
    type: Number
  },
  order: {
    type: Number
  },
  toPrint: {
    type: Boolean
  },
  public: {
    type: Boolean
  }
});

imageSchema.plugin(mongoosePaginate);

imageSchema.pre('save', function (next) {
  // console.log('---BEFORE CREATE IMAGE');
  // console.log(this.title);

  this.albums.forEach(albumId => {
    this.model('Album').findOneAndUpdate({
        _id: albumId
      }, {
        $addToSet: {
          'images': this._id
        }
      }, {
        safe: true,
        upsert: true,
        new: true,
        useFindAndModify: false
      },
      function (err, model) {
        // console.log(err, model);
      }
    );
  });

  next();
});

const Image = mongoose.model('Image', imageSchema);

export default Image;
