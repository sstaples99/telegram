var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var itemSchema = new Schema({
    title: {type: String},
    description: {type: String},
    price: {type: String},
    tags: {type: Array, default: []},
    notes: {type: Array, default: []},
    clientID: {type: String, required: true},
    order: {type: Number}
});

module.exports = mongoose.model('Item', itemSchema);
