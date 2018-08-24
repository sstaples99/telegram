const mongoose = require('mongoose');

const { Schema } = mongoose;
const eventSchema = new Schema({
  title: { type: String, default: 'New Event (Untitled)' },
  start: { type: String, default: new Date().toDateString() },
  end: { type: String, default: new Date().toDateString() },
  description: { type: String },
  url: { type: String, default: '' },
  img: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  clientID: { type: String, required: true },
});

module.exports = mongoose.model('Event', eventSchema);
