var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var itemSchema = new Schema({
    title: {type: String, default: "New Item (Untitled)"},
    description: {type: String, default: ""},
    price: {type: String, default: ""},
    tags: {type: Array, default: []},
    notes: {type: Array, default: []},
    clientID: {type: String, required: true},
    order: {type: Number}
});

module.exports = mongoose.model('Item', itemSchema);

