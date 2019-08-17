import mongoose from 'mongoose';

import Image from './image';
import Album from './album';
import Tag from './tag';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

const models = { Image, Album, Tag };

export { connectDb };

export default models;
