import { Router } from 'express';

const router = Router();

router.get('/', async (req, res) => {
  const images = await req.context.models.Image.find();
  return res.send(images);
});

// router.get('/:messageId', async (req, res) => {
//   const message = await req.context.models.Message.findById(
//     req.params.messageId,
//   );
//   return res.send(message);
// });

router.post('/', async (req, res) => {
  // console.log(req.body);

  const image = await req.context.models.Image.create({
    title: req.body.title,
    // albums: req.body.albums
  });

  return res.send(image);
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
