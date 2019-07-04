import mongoose from 'mongoose';

// import User from './user';
import Image from './image';
import Album from './album';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true });
};

// const models = { User, Image };
const models = { Image, Album };

export { connectDb };

export default models;
