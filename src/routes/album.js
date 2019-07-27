import { Router } from 'express';
import { getSignedUrl } from '../utils/s3';

const router = Router();

router.get('/all', async (req, res) => {
  await req.context.models.Album
    .find()
    .populate('cover')
    .lean()
    .exec((err, albums) => {
      if (err) return res.status(500).send(err);

      albums.forEach(album => {
        if (album.cover) {
          album.cover.signedUrl = getSignedUrl(album.cover, 'small');
        }
      });

      return res.send(JSON.stringify({ 'albums': albums }));
    });
  // console.log(albums);
  // return res.send(JSON.stringify({ 'albums': albums }));
});

router.get('/:albumId', async (req, res) => {
  await req.context.models.Album
    .findById(
      req.params.albumId,
    )
    .populate('images')
    .populate('cover')
    .lean()
    .exec((err, album) => {
      if (err) return res.status(500).send(err);

      album.images.forEach(image => {
        // console.log('----');
        image.signedUrl = getSignedUrl(image, 'small');
      });

      if (album.cover) {
        album.cover.signedUrl = getSignedUrl(album.cover, 'big');
      }

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

router.put('/:albumId', async (req, res) => {
  await req.context.models.Album
    .findByIdAndUpdate(
      req.params.albumId,
      req.body,
      { new: true }
    )
    .populate('cover')
    .lean()
    .exec((err, album) => {
      if (err) return res.status(500).send(err);

      if (req.body.cover) {
        album.cover.signedUrl = getSignedUrl(album.cover, 'big');
      }

      return res.send(JSON.stringify({ 'album': album }));
    });
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
