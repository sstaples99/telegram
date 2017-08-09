var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var usersSchema = new Schema({
    name: {type: String, required: true},
    position: {type: String},
    email: {type: String, required: true},
    phone: {type: String},
    password: {type: String, required: true},
    status: {
      level: {type: String, default: 'member'},
      services: {type: Array, default: []}
    },
    clientID: {type: String, required: true}
  });

usersSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
}

usersSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
}

module.exports = mongoose.model('User', usersSchema);
