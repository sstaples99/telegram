var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var tagSchema = new Schema({
    name: {type: String},
    clientID: {type: String, required: true},
    img: {type: String, default: ""}
});

module.exports = mongoose.model('tag', tagSchema);

