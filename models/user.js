const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');

const { Schema } = mongoose;
const usersSchema = new Schema({
  name: { type: String, required: true },
  position: { type: String },
  email: { type: String, required: true },
  phone: { type: String },
  password: { type: String, required: true },
  status: {
    level: { type: String, default: 'member' },
    services: { type: Array, default: [] },
  },
  img: { type: String, default: '/img/backgrounds/user.png' },
  clientIDs: { type: Array, required: true },
});

usersSchema.methods.generateHash = function (password) { // eslint-disable-line func-names
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

usersSchema.methods.validPassword = function (password) { // eslint-disable-line func-names
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', usersSchema);
