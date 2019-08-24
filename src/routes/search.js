import { Router } from 'express';

const router = Router();

router.get('/:searchQuery', async (req, res) => {
  await req.context.models.Image
    .find(req.params.searchQuery)
    .populate({
      path: 'images',
      populate: {
        path: 'tags'
      }
    })
    .lean()
    .exec((err, images) => {
      if (err) return res.status(500).send(err);

      // if (search && search.images) {
      //   search.images.forEach(image => {
      //     // console.log('----');
      //     image.signedUrl = getSignedUrl(image, 'small');
      //   });
      // }

      // if (search && search.cover) {
      //   search.cover.signedUrl = getSignedUrl(search.cover, 'big');
      // }

      const response = {
        'results': results
      };

      return res.status(200).send(response);
    });
});

export default router;
