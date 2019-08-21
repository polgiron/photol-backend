import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  data: {
    type: Object
  }
}, {
  collection: 'settings',
  capped: { size: 1024, max: 1 }
});

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
