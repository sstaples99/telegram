var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var eventSchema = new Schema({
  title: {type: String},
  start: {type: String, required: true},
  end: {type: String},
  description: {type: String},
  url: {type: String},
  img: {type: String},
  featured: {type: Boolean},
  clientID: {type: String, required: true}
});

module.exports = mongoose.model('Event', eventSchema);

