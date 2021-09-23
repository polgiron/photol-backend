import 'dotenv/config'
import models, { connectDb } from '../models'

connectDb().then(async () => {
  const darkroomSettings = {
    duration: null,
    contrast: null,
    aperture: null,
    note: null
  }
  models.Image.updateMany(
    {},
    {
      darkroomSettings: darkroomSettings
    },
    (error, success) => {
      if (error) {
        console.log('error:', error)
      }
      if (success) {
        console.log('success:', success)
      }
      process.exit(0)
    }
  )
})
