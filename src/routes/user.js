import { Router } from 'express'

const router = Router()

router.get('/email/:email', async (req, res) => {
  await req.context.models.User.findOne({
    email: req.params.email
  }).exec((err, user) => {
    if (err) return res.status(500).send(err)

    const response = {
      user: user
    }

    return res.status(200).send(response)
  })
})

export default router
