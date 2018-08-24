const mongoose = require('mongoose');

const { Schema } = mongoose;
const clientSchema = new Schema({
  name: { type: String, required: true },
  uniqname: { type: String, required: true },
  services: { type: Array, default: [] },
  users: { type: Array, default: [] },
});

module.exports = mongoose.model('Client', clientSchema);
