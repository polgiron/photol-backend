import { Router } from 'express'
import passport from 'passport'
import mongoose from 'mongoose'
const User = mongoose.model('User')

const router = Router()

router.post('/register', async (req, res) => {
  if (!validateEmail(req.body.email)) {
    return res.status(500).json({
      error: 'Unvalid email'
    })
  } else if (!req.body.name || req.body.name == '') {
    return res.status(500).json({
      error: 'Needs a name'
    })
  } else {
    const user = new User()

    user.name = req.body.name
    user.email = req.body.email

    user.setPassword(req.body.password)
    user.initSettings(req.context.models.Settings, user._id)

    user.save(function (err) {
      if (err) return res.status(500).send(err)

      const token = user.generateJwt()
      res.status(200).json({
        token: token
      })
    })
  }
})

router.post('/login', async (req, res) => {
  passport.authenticate('local', function (err, user, info) {
    // If Passport throws/catches an error
    if (err) {
      res.status(404).json(err)
      return
    }

    // If a user is found
    if (user) {
      const token = user.generateJwt()
      res.status(200).json({
        token: token
      })
    } else {
      // If user is not found
      // console.log('here');
      // console.log(info);
      res.status(401).json(info)
    }
  })(req, res)
})

const validateEmail = (email) => {
  const re =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

export default router
