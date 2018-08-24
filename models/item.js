const mongoose = require('mongoose');

const { Schema } = mongoose;
const itemSchema = new Schema({
  title: { type: String, default: 'New Item (Untitled)' },
  description: { type: String, default: '' },
  price: { type: String, default: '' },
  tags: { type: Array, default: [] },
  notes: { type: Array, default: [] },
  subsection: { type: String },
  clientID: { type: String, required: true },
  order: { type: Number },
});

module.exports = mongoose.model('Item', itemSchema);
