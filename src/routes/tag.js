import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  await req.context.models.Tag.create({
    value: req.body.value,
    // images: req.body.images ? req.body.images : []
  }, (err, tag) => {
    if (err) return res.status(500).send(err);

    if (req.body.images) {
      req.body.images.forEach(imageId => {
        req.context.models.Image.findOneAndUpdate(
          { _id: imageId },
          { $addToSet: { 'tags': tag._id } },
          { safe: true, upsert: true, new: true, useFindAndModify: false },
          function (err, model) {
            console.log(err, model);
          }
        );
      });
    }

    const response = {
      message: 'Tag successfully created',
      tag: tag
    };

    return res.status(200).send(response);
  });
});

router.get('/all', async (req, res) => {
  await req.context.models.Tag.find((err, tags) => {
    if (err) return res.status(500).send(err);

    const response = {
      'tags': tags
    };

    return res.status(200).send(response);
  }).lean();
});

router.delete('/:tagId', async (req, res) => {
  await req.context.models.Tag.findByIdAndRemove(req.params.tagId, (err, tag) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: "Tag successfully deleted",
      id: tag._id
    };

    return res.status(200).send(response);
  });
});

export default router;
