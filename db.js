const mongoose = require('mongoose');

const url = `mongodb://${process.env.db_user}:${process.env.db_pass}@telegram-shard-00-00.s9vo5.mongodb.net:27017,telegram-shard-00-01.s9vo5.mongodb.net:27017,telegram-shard-00-02.s9vo5.mongodb.net:27017/telegram?ssl=true&replicaSet=atlas-5mzy9e-shard-0&authSource=admin&retryWrites=true&w=majority`;
mongoose.connect(url);

module.exports = mongoose.connection;
