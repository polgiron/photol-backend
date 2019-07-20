import { Router } from 'express';
import { getSignedUrl } from '../utils/s3';

const router = Router();

router.get('/all', async (req, res) => {
  const albums = await req.context.models.Album.find();
  // console.log(albums);
  return res.send(JSON.stringify({ 'albums': albums }));
});

router.get('/:albumId', async (req, res) => {
  await req.context.models.Album
    .findById(
      req.params.albumId,
    )
    .populate('images')
    .lean()
    .exec((err, album) => {
      // if (err) return handleError(err);

      album.images.forEach(image => {
        // console.log('----');
        image.signedUrl = getSignedUrl(image, 'small');
      });

      return res.send(JSON.stringify({ 'album': album }));
    });
});

router.get('/roll/:rollId', async (req, res) => {
  const album = await req.context.models.Album.findOne({ rollId: req.params.rollId });
  // console.log('album');
  // console.log(album);
  // return res.send(album);
  return res.send(JSON.stringify({ 'album': album }));
});

// router.get('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId,
//   );
//   return res.send(message);
// });

router.post('/', async (req, res) => {
  // console.log(req.body);

  const album = await req.context.models.Album.create({
    title: req.body.title,
    rollId: req.body.rollId
  });

  return res.send(album);
});

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
