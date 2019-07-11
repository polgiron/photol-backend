import { Router } from 'express';
import sizeOf from 'image-size';
import multer from 'multer';
import S3 from '../utils/s3';

const generateS3Key = function(mimetype) {
  return 'original/' + Date.now().toString() + '.' + mimetype.replace('image/', '');
};

const upload = multer({
  // limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadToS3 = function(file, callback) {
  S3.upload({
    // ACL: 'public-read',
    Body: file.buffer,
    // Body: fs.createReadStream(file.buffer),
    Key: generateS3Key(file.mimetype),
    ContentType: file.mimetype
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

router.get('/all', async (req, res) => {
  const images = await req.context.models.Image.find().lean();
  return res.send(images);
});

router.post('/', upload.single('file'), (req, res) => {
  // console.log('file to upload');
  // console.log(req.file);

  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file1').end();
  }

  if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
    return res.status(403).send('expect image file').end();
  }

  uploadToS3(req.file, (err, data) => {
    // console.log('---');
    // console.log('S3 callback', err, data);

    if (err) {
      console.error(err);
      return res.status(500).send('failed to upload to s3').end();
    }

    const dimensions = sizeOf(req.file.buffer);

    req.context.models.Image.create({
      title: req.body.title,
      albums: req.body.albums ? req.body.albums : [],
      s3_key: data.key,
      type: req.file.mimetype,
      original_width: dimensions.width,
      original_height: dimensions.height
    });

    res.status(200)
      .send('File uploaded to S3')
      .end();
  });
});

// router.get('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId,
//   );
//   return res.send(message);
// });

// async function uploadToS3(params) {
//   return await s3.upload(params, (err, data) => {
//     if (err) { return console.log(err) };

//     // Save data.Location in your database
//     console.log('Image successfully uploaded.');
//     console.log(data.Location);

//     return data.Location;
//   });
// }

// router.delete('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId,
//   );

//   let result = null;
//   if (message) {
//     result = await message.remove();
//   }

//   return res.send(result);
// });

export default router;
