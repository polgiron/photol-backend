import { Router } from 'express';

// S3
import aws from 'aws-sdk';

// ---
// AWS

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: 'eu-west-3'
});

const s3 = new aws.S3();


// ---
// Routes

const router = Router();

router.get('/', async (req, res) => {
  const images = await req.context.models.Image.find();
  return res.send(images);
});

// router.get('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId,
//   );
//   return res.send(message);
// });

router.post('/', async (req, res) => {
  console.log(req.body.title);

  const base64Data = new Buffer.from(req.body.base64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
  const type = req.body.base64.split(';')[0].split('/')[1];

  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: 'original/' + Date.now().toString(),
    Body: base64Data,
    ACL: 'public-read',
    ContentEncoding: 'base64',
    ContentType: `image/${type}`
  };

  s3.upload(params, (err, data) => {
    if (err) { return console.log(err) };

    console.log('Image successfully uploaded.');
    console.log(data.Location);

    req.context.models.Image.create({
      title: req.body.title,
      albums: req.body.albums ? req.body.albums : [],
      url_o: data.Location
    });

    // return data.Location;
    return res.send(true);
  });

  // uploadToS3(params).then(location => {
  //   console.log('HEREEE');
  //   // console.log('location', location);

    // const image = await req.context.models.Image.create({
    //   title: req.body.title,
    //   // albums: req.body.albums
    // });

  //   // return res.send(image);
  // });

  // const image = await req.context.models.Image.create({
  //   title: req.body.title,
  //   // albums: req.body.albums
  // });
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
