import mongoose from 'mongoose';

const tagSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique: true
  },
  // images: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Image'
  // }]
});

// tagSchema.pre('save', function (next) {
//   // console.log('---BEFORE CREATE TAG');
//   // console.log(this.title);

//   if (this.images) {
//     this.images.forEach(imageId => {
//       this.model('Image').findOneAndUpdate(
//         { _id: imageId },
//         { $addToSet: { 'tags': this._id } },
//         { safe: true, upsert: true, new: true, useFindAndModify: false },
//         function (err, model) {
//           // console.log(err, model);
//         }
//       );
//     });
//   }

//   next();
// });

const Tag = mongoose.model('Tag', tagSchema);

export default Tag;
