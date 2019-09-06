import { Router } from 'express';
import { authGuard } from '../utils/auth-guard.js';

const router = Router();

router.get('/', authGuard, async (req, res) => {
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

router.post('/', authGuard, async (req, res) => {
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

export default router;
