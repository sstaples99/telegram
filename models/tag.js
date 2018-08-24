const mongoose = require('mongoose');

const { Schema } = mongoose;
const tagSchema = new Schema({
  name: { type: String },
  id: { type: String },
  header_img: { type: String },
  clientID: { type: String, required: true },
  img: { type: String, default: '' },
  submenus: { type: Array, default: [] },
});

module.exports = mongoose.model('tag', tagSchema);
