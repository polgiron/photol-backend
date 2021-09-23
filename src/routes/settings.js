import { Router } from 'express'
import { authGuard } from '../utils/auth-guard.js'

const router = Router()

router.get('/', authGuard, async (req, res) => {
  await req.context.models.Settings.findOne({ user: req.payload._id }).exec(
    (err, settings) => {
      if (err) return res.status(500).send(err)

      const response = {
        settings: settings.data
      }

      return res.status(200).send(response)
    }
  )
})

router.put('/', authGuard, async (req, res) => {
  await req.context.models.Settings.findOneAndUpdate(
    { user: req.payload._id },
    req.body,
    { new: true }
  ).exec((err, settings) => {
    if (err) return res.status(500).send(err)
    return res.send(JSON.stringify({ settings: settings }))
  })
})

export default router
