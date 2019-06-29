import mongoose from 'mongoose';

// import User from './user';
import Image from './image';

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL);
};

// const models = { User, Image };
const models = { Image };

export { connectDb };

export default models;
