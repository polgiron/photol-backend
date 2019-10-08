import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    unique: true,
    required: true
  },
  data: {
    type: Object
  }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
