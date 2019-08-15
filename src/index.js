import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import models, { connectDb } from './models';
import routes from './routes';

const app = express();

// Body parser express built in
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
const whitelist = ['https://photol.paulgiron.com', 'http://localhost:4200'];
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
app.use(cors(corsOptions));


// ---
// App middleware

app.use(async (req, res, next) => {
  req.context = {
    models,
    // me: await models.User.findByLogin('rwieruch'),
  };
  next();
});


// ---
// Routes

app.use('/image', routes.image);
app.use('/album', routes.album);


// ---
// Start server

const eraseDatabaseOnSync = false;
// const eraseDatabaseOnSync = true;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.Image.deleteMany({}),
      models.Album.deleteMany({}),
    ]);

    // createAlbumWithImages();
  }

  app.listen(process.env.PORT, () => {
    console.log('-----------');
    console.log(`listening on port ${process.env.PORT}!`);
  });
});

const createAlbumWithImages = async () => {
  const album = new models.Album({
    title: 'hello album!'
  });

  const image1 = new models.Image({
    title: 'hello world image',
    albums: [album.id]
  });

  const image2 = new models.Image({
    title: 'hello world image 2',
    albums: [album.id]
  });

  await album.save();
  await image1.save();
  await image2.save();
};
