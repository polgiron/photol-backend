import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import passport from 'passport';

import models, { connectDb } from './models';
import routes from './routes';

import './config/passport';

const app = express();

// Body parser express built in
app.use(express.json({ limit: '50mb', extended: true }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// CORS
// const whitelist = ['https://photol.paulgiron.com', 'http://localhost:4200'];
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (whitelist.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }, credentials: true
// };
// app.use(cors(corsOptions));
app.use(cors());


// ---
// App middleware

app.use(async (req, res, next) => {
  req.context = {
    models
  };
  next();
});

app.use(passport.initialize());

// Error handlers
// Catch unauthorised errors
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      "message": err.name + ": " + err.message
    });
  }
});


// ---
// Routes
import { authGuard } from './utils/auth-guard.js';

app.use('/image', routes.image, authGuard);
app.use('/album', routes.album);
app.use('/tag', routes.tag);
app.use('/settings', routes.settings);
app.use('/search', routes.search);
app.use('/auth', routes.auth);
app.use('/user', routes.user);


// ---
// Start server

const eraseDatabaseOnSync = false;
// const eraseDatabaseOnSync = true;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.Image.deleteMany({}),
      models.Album.deleteMany({}),
      models.Tag.deleteMany({}),
      models.User.deleteMany({})
    ]);

    // createAlbumWithImages();
  }

  // createSettings();

  app.listen(process.env.PORT, () => {
    console.log('-----------');
    console.log(`listening on port ${process.env.PORT}!`);
  });
});

// const createSettings = async () => {
//   const settings = new models.Settings({
//     data: {
//       editMode: true,
//       displayTags: false
//     }
//   });

//   await settings.save();
// };

// const createAlbumWithImages = async () => {
//   const album = new models.Album({
//     title: 'hello album!'
//   });

//   const image1 = new models.Image({
//     title: 'hello world image',
//     albums: [album.id]
//   });

//   const image2 = new models.Image({
//     title: 'hello world image 2',
//     albums: [album.id]
//   });

//   await album.save();
//   await image1.save();
//   await image2.save();
// };
