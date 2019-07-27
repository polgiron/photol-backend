import { Router } from 'express';
import sizeOf from 'image-size';
import multer from 'multer';
import sharp from 'sharp';
import { S3, getSignedUrl, deleteFromS3 } from '../utils/s3';

const generateS3Key = function(isThumb, dateId, mimetype, thumbSize) {
  const folder = isThumb ? 'thumb/' : 'ori/';
  const thumbSizePath = isThumb ? `_${thumbSize}` : '';
  return folder + dateId + thumbSizePath + '.' + mimetype.replace('image/', '');
  // return 'original/' + Date.now().toString() + '.' + mimetype.replace('image/', '');
};

const generateThumbnails = function(imageBuffer, dateId, mimetype, thumbSize) {
  const thumbnailBuffer = sharp(imageBuffer)
    .resize(Number(thumbSize), Number(thumbSize), {
      fit: 'inside'
    });

  uploadToS3(thumbnailBuffer, dateId, mimetype, true, thumbSize, (err, data) => {
    // console.log('---');
    // console.log('S3 callback THUMB', err, data);
  });
};

const upload = multer({
  // limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadToS3 = function(fileBuffer, dateId, mimetype, isThumb, thumbSize, callback) {
  S3.upload({
    // ACL: 'public-read',
    Body: fileBuffer,
    // Body: fs.createReadStream(file.buffer),
    Key: generateS3Key(isThumb, dateId, mimetype, thumbSize),
    // Key: generateS3Key(file.mimetype),
    ContentType: mimetype
    // ContentType: 'application/octet-stream' // force download if it's accessed as a top location
  })
  // http://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3/ManagedUpload.html#httpUploadProgress-event
  .on('httpUploadProgress', event => {
    // console.log('---');
    // console.log('event', event);
  })
  .send(callback);
};


// ---
// Routes

const router = Router();

router.post('/', upload.single('file'), (req, res) => {
  // console.log('file to upload');
  // console.log(req.file);

  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file1').end();
  }

  if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
    return res.status(403).send('expect image file').end();
  }

  const dateId = Date.now().toString();

  generateThumbnails(req.file.buffer, dateId, req.file.mimetype, process.env.SMALL_THUMB_SIZE);
  generateThumbnails(req.file.buffer, dateId, req.file.mimetype, process.env.BIG_THUMB_SIZE);

  uploadToS3(req.file.buffer, dateId, req.file.mimetype, false, null, (err, data) => {
    // console.log('---');
    // console.log('S3 callback ORI', err, data);

    if (err) {
      console.error(err);
      return res.status(500).send('failed to upload to s3').end();
    }

    const dimensions = sizeOf(req.file.buffer);

    req.context.models.Image.create({
      // title: req.body.title,
      albums: req.body.albums ? req.body.albums : [],
      s3Key: data.key,
      s3Id: dateId,
      type: req.file.mimetype,
      extension: req.file.mimetype.replace('image/', ''),
      oriWidth: dimensions.width,
      oriHeight: dimensions.height,
      favorite: false
    });

    res.status(200)
      .send('File uploaded to S3')
      .end();
  });
});

router.put('/:imageId', async (req, res) => {
  // const image = await req.context.models.Image.findById(
  //   req.params.imageId
  // );

  // image.favorite = req.body.favorite;

  await req.context.models.Image.findByIdAndUpdate(
    // the id of the item to find
    req.params.imageId,

    // the change to be made. Mongoose will smartly combine your existing
    // document with this change, which allows for partial updates too
    req.body,

    // an option that asks mongoose to return the updated version
    // of the document instead of the pre-updated one.
    { new: true },

    // the callback function
    (err, image) => {
      // Handle any possible database errors
      if (err) return res.status(500).send(err);
      return res.send(image);
    }
  );

  // return res.send(JSON.stringify({ 'image': image }));
});

router.get('/all', async (req, res) => {
  const images = await req.context.models.Image.find().lean();
  return res.send(images);
});

router.get('/:imageId/big', async (req, res) => {
  const image = await req.context.models.Image.findById(
    req.params.imageId
  );

  const signedUrl = getSignedUrl(image, 'big');

  return res.send(JSON.stringify({ 'signedUrl': signedUrl }));
});

// async function uploadToS3(params) {
//   return await s3.upload(params, (err, data) => {
//     if (err) { return console.log(err) };

//     // Save data.Location in your database
//     console.log('Image successfully uploaded.');
//     console.log(data.Location);

//     return data.Location;
//   });
// }

router.delete('/:imageId', async (req, res) => {
  await req.context.models.Image.findByIdAndRemove(req.params.imageId, (err, image) => {
    if (err) return res.status(500).send(err);

    deleteFromS3(image);

    const response = {
      message: "Image successfully deleted",
      id: image._id
    };

    return res.status(200).send(response);
  });
});

export default router;
