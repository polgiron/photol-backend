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
    .findById(req.params.albumId)
    .populate('cover')
    .populate({
      path: 'images',
      populate: {
        path: 'tags'
      }
    })
    .lean()
    .exec((err, album) => {
      if (err) return res.status(500).send(err);

      if (album && album.images) {
        album.images.forEach(image => {
          // console.log('----');
          image.signedUrl = getSignedUrl(image, 'small');
        });
      }

      if (album && album.cover) {
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
  await req.context.models.Album.create({
    title: req.body.title,
    rollId: req.body.rollId,
    date: req.body.date
  }, (err, album) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'Album successfully created',
      album: album
    };

    return res.status(200).send(response);
  });
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

router.delete('/:albumId', async (req, res) => {
  await req.context.models.Album.findByIdAndRemove(req.params.albumId, (err, album) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'Album successfully deleted',
      id: album._id
    };

    return res.status(200).send(response);
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
