import { Router } from 'express';

const router = Router();

router.get('/all', async (req, res) => {
  const albums = await req.context.models.Album.find();
  // console.log(albums);
  return res.send(albums);
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
