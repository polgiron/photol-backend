import {
  Router
} from 'express';
import sizeOf from 'image-size';
import multer from 'multer';
import sharp from 'sharp';
import {
  S3,
  getSignedUrl,
  deleteFromS3
} from '../utils/s3';
import {
  authGuard
} from '../utils/auth-guard.js';

const generateS3Key = function (isThumb, dateId, mimetype, thumbSize, email) {
  const folder = isThumb ? 'thumb/' : 'ori/';
  const thumbSizePath = isThumb ? `_${thumbSize}` : '';
  return email + '/' + folder + dateId + thumbSizePath + '.' + mimetype.replace('image/', '');
};

const generateThumbnails = function (imageBuffer, dateId, mimetype, thumbSize, email) {
  const thumbnailBuffer = sharp(imageBuffer)
    .resize(Number(thumbSize), Number(thumbSize), {
      fit: 'inside'
    });

  uploadToS3(thumbnailBuffer, dateId, mimetype, true, thumbSize, email, (err, data) => {
    // console.log('---');
    // console.log('S3 callback THUMB', err, data);
  });
};

const upload = multer({
  // limits: { fileSize: 10 * 1024 * 1024 }
});

const uploadToS3 = function (fileBuffer, dateId, mimetype, isThumb, thumbSize, email, callback) {
  S3.upload({
      // ACL: 'public-read',
      Body: fileBuffer,
      // Body: fs.createReadStream(file.buffer),
      Key: generateS3Key(isThumb, dateId, mimetype, thumbSize, email),
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

router.post('/', authGuard, upload.single('file'), (req, res) => {
  // console.log('file to upload');
  // console.log(req.file);

  if (!req.file) {
    return res.status(403).send('expect 1 file upload named file1').end();
  }

  if (!/^image\/(jpe?g|png|gif)$/i.test(req.file.mimetype)) {
    return res.status(403).send('expect image file').end();
  }

  const dateId = Date.now().toString();

  // BDD
  const dimensions = sizeOf(req.file.buffer);
  req.context.models.Image.create({
    albums: req.body.albums ? req.body.albums : [],
    s3Id: dateId,
    type: req.file.mimetype,
    extension: req.file.mimetype.replace('image/', ''),
    oriWidth: dimensions.width,
    oriHeight: dimensions.height,
    ratio: dimensions.width / dimensions.height,
    date: req.body.date ? req.body.date : null,
    stars: req.body.stars ? req.body.stars : 0,
    user: req.payload._id,
    order: req.body.order
  });

  generateThumbnails(req.file.buffer, dateId, req.file.mimetype, process.env.SMALL_THUMB_SIZE, req.payload.email);
  generateThumbnails(req.file.buffer, dateId, req.file.mimetype, process.env.BIG_THUMB_SIZE, req.payload.email);

  uploadToS3(req.file.buffer, dateId, req.file.mimetype, false, null, req.payload.email, (err, data) => {
    // console.log('---');
    // console.log('S3 callback ORI', err, data);

    if (err) {
      console.error(err);
      return res.status(500).send('failed to upload to s3').end();
    }

    res.status(200)
      .send('File uploaded to S3')
      .end();
  });
});

router.put('/:imageId', authGuard, async (req, res) => {
  // console.log('Updating image');
  // console.log(req.body);

  await req.context.models.Image.findByIdAndUpdate(
    req.params.imageId,
    req.body, {
      new: true
    }, (err, image) => {
      if (err) return res.status(500).send(err);

      if (req.body.tags) {
        // console.log('Updating image tags');
        req.body.tags.map(tag => {
          // console.log(tag.value);
          req.context.models.Tag.findByIdAndUpdate(tag._id, {
            $addToSet: {
              'images': image._id
            }
          }, {
            safe: true,
            upsert: true,
            new: true,
            useFindAndModify: false
          }, (err, tag) => {
            // console.log(err, tag.images);
          });
        });
      }

      return res.send(image);
    });
});

router.get('/all', authGuard, async (req, res) => {
  // await req.context.models.Image.find((err, images) => {
  //   if (err) return res.status(500).send(err);

  //   const response = {
  //     'images': images
  //   };

  //   return res.status(200).send(response);
  // }).populate('tags').lean();

  // User id
  // console.log(req.payload._id);

  const options = {
    page: req.query.page,
    limit: req.query.limit,
    lean: true,
    populate: 'tags albums'
  };

  await req.context.models.Image.paginate({
    user: req.payload._id
  }, options, async (err, result) => {
    // console.log(err);
    // console.log(result.docs.length);
    // result.docs
    // result.totalDocs = 100
    // result.limit = 10
    // result.page = 1
    // result.totalPages = 10
    // result.hasNextPage = true
    // result.nextPage = 2
    // result.hasPrevPage = false
    // result.prevPage = null
    // result.pagingCounter = 1

    if (err) return res.status(500).send(err);

    result.docs.forEach(image => {
      image.signedUrl = getSignedUrl(image, req.payload.email, 'small');
      // image.rollId = image.albums[0].rollId;
    });

    const response = {
      images: result.docs,
      hasMore: result.hasNextPage,
      totalImages: result.totalDocs
    };

    return res.status(200).send(response);
  });
});

router.get('/:imageId/big', authGuard, async (req, res) => {
  await req.context.models.Image.findById(req.params.imageId, (err, image) => {
    if (err) return res.status(500).send(err);

    image.signedUrl = getSignedUrl(image, req.payload.email, 'big');

    const response = {
      'image': image
    };

    return res.status(200).send(response);
  }).populate('tags').lean();
});

router.get('/favorites', authGuard, authGuard, async (req, res) => {
  await req.context.models.Image.find({
    stars: {
      $gt: 0
    },
    user: req.payload._id
  }, null, {
    sort: {
      stars: -1
    }
  }, (err, images) => {
    if (err) return res.status(500).send(err);

    images.forEach(image => {
      image.signedUrl = getSignedUrl(image, req.payload.email, 'small');
    });

    const response = {
      'images': images
    };

    return res.status(200).send(response);
  }).populate('tags albums').lean();
});

router.get('/:imageId/signedUrl', authGuard, async (req, res) => {
  await req.context.models.Image.findById(req.params.imageId, (err, image) => {
    if (err) return res.status(500).send(err);

    const signedUrl = getSignedUrl(image, req.payload.email, req.query.size);

    const response = {
      'signedUrl': signedUrl
    };

    return res.status(200).send(response);
  }).lean();
});

router.delete('/:imageId', authGuard, async (req, res) => {
  await req.context.models.Image.findByIdAndRemove(req.params.imageId, (err, image) => {
    if (err) return res.status(500).send(err);

    deleteFromS3(image);

    const response = {
      message: 'Image successfully deleted',
      id: image._id
    };

    return res.status(200).send(response);
  });
});

export default router;
