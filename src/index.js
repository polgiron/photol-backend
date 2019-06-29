import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import models, { connectDb } from './models';
import routes from './routes';

const app = express();

// import bodyParser from 'body-parser';
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// Body parser express built in
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cors ONLY DEV, needs whitelist
app.use(cors());


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

// app.use('/session', routes.session);
// app.use('/users', routes.user);
app.use('/image', routes.image);


// ---
// Start server

const eraseDatabaseOnSync = true;

connectDb().then(async () => {
  if (eraseDatabaseOnSync) {
    await Promise.all([
      models.Image.deleteMany({}),
    ]);

    createImages();
  }

  app.listen(process.env.PORT, () =>
    console.log(`Example app listening on port ${process.env.PORT}!`),
  );
});

const createImages = async () => {
  const image1 = new models.Image({
    title: 'hello world image'
  });

  await image1.save();
};
