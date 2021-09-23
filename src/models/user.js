import mongoose from 'mongoose'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  hash: String,
  salt: String
})

userSchema.methods.setPassword = function (password) {
  this.salt = crypto.randomBytes(16).toString('hex')
  this.hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex')
}

userSchema.methods.validPassword = function (password) {
  const hash = crypto
    .pbkdf2Sync(password, this.salt, 1000, 64, 'sha512')
    .toString('hex')
  return this.hash === hash
}

userSchema.methods.initSettings = function (settingsModel, userId) {
  const settings = new settingsModel({
    user: userId,
    data: {
      editMode: true,
      displayTags: false
    }
  })
  settings.save()
}

userSchema.methods.generateJwt = function () {
  const expiry = new Date()
  expiry.setDate(expiry.getDate() + 7)

  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      name: this.name,
      exp: parseInt(expiry.getTime() / 1000)
    },
    process.env.TOKEN_SECRET
  )
}

const User = mongoose.model('User', userSchema)

export default User
