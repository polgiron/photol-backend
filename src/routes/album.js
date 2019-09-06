import { Router } from 'express';
import { getSignedUrl } from '../utils/s3';
import { authGuard } from '../utils/auth-guard.js';

const router = Router();

router.get('/all', authGuard, async (req, res) => {
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

      const response = {
        'albums': albums
      };

      return res.status(200).send(response);
    });
});

router.get('/:albumId', authGuard, async (req, res) => {
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

      const response = {
        'album': album
      };

      return res.status(200).send(response);
    });
});

router.get('/roll/:rollId', authGuard, async (req, res) => {
  const album = await req.context.models.Album.findOne({ rollId: req.params.rollId });
  // console.log('album');
  // console.log(album);
  // return res.send(album);
  return res.send(JSON.stringify({ 'album': album }));
});

router.post('/', authGuard, async (req, res) => {
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

router.put('/:albumId', authGuard, async (req, res) => {
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

router.delete('/:albumId', authGuard, async (req, res) => {
  await req.context.models.Album.findByIdAndRemove(req.params.albumId, (err, album) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'Album successfully deleted',
      id: album._id
    };

    return res.status(200).send(response);
  });
});

export default router;
