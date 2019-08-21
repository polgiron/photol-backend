import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  await req.context.models.Settings
    .find()
    .exec((err, settings) => {
      if (err) return res.status(500).send(err);

      const response = {
        'settings': settings[0].data
      };

      return res.status(200).send(response);
    });
});

router.post('/', async (req, res) => {
  await req.context.models.Settings.create({
    data: req.body.data
  }, (err, settings) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'Settings successfully updated',
      settings: settings
    };

    return res.status(200).send(response);
  });
});

// router.put('/', async (req, res) => {
//   await req.context.models.Settings
//     .findOneAndUpdate(
//       {},
//       req.body,
//       { new: true }
//     )
//     .exec((err, settings) => {
//       if (err) return res.status(500).send(err);

//       console.log('settings');
//       console.log(settings);

//       return res.send(JSON.stringify({ 'settings': settings }));
//     });
// });

export default router;
