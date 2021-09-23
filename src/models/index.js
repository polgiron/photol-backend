import mongoose from 'mongoose'

import Image from './image'
import Album from './album'
import Tag from './tag'
import Settings from './settings'
import User from './user'

// Remove deprecations logs
mongoose.set('useFindAndModify', false)
mongoose.set('useUnifiedTopology', true)

const connectDb = () => {
  return mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
  })
}

const models = { Image, Album, Tag, Settings, User }

export { connectDb }

export default models
