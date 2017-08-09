module.exports = function() {
  var mongoose = require('mongoose');
  var Schema = mongoose.Schema;
  var bcrypt = require('bcrypt-nodejs');

  var clientSchema = new Schema({
      uniqname: {type: String, required: true},
      services: {type: Array, default: []},
      users: {type: Array, default: []}
    });

  return mongoose.model('Client', clientSchema);

}
