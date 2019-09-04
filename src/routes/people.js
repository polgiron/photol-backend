import { Router } from 'express';

const router = Router();

router.post('/', async (req, res) => {
  await req.context.models.People.create({
    name: req.body.name
  }, (err, people) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'People successfully created',
      people: people
    };

    return res.status(200).send(response);
  });
});

router.get('/all', async (req, res) => {
  await req.context.models.People.find((err, peoples) => {
    if (err) return res.status(500).send(err);

    const response = {
      'peoples': peoples
    };

    return res.status(200).send(response);
  });
});

router.delete('/:peopleId', async (req, res) => {
  await req.context.models.People.findByIdAndRemove(req.params.peopleId, (err, people) => {
    if (err) return res.status(500).send(err);

    const response = {
      message: 'People successfully deleted',
      id: people._id
    };

    return res.status(200).send(response);
  });
});

export default router;
