import mongoose from 'mongoose';

import Image from './image';
import Album from './album';
import Tag from './tag';
import Settings from './settings';
import People from './people';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

const models = { Image, Album, Tag, Settings, People };

export { connectDb };

export default models;
