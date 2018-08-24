const mongoose = require('mongoose');

const url = `mongodb://${process.env.db_user}:${process.env.db_pass}@ds011903.mlab.com:11903/telegram`;
mongoose.connect(url);

module.exports = mongoose.connection;
