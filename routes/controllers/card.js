const _ = require('lodash');
const eventSchema = require('../../models/event');
const itemSchema = require('../../models/item');
const partySchema = require('../../models/party');
const tagSchema = require('../../models/tag');

const schemas = {
  item: itemSchema,
  event: eventSchema,
  partie: partySchema,
  tag: tagSchema,
};

const { countEntries } = require('../utilities/utilities');

const createCard = (schema, data, duplicate) =>
  new Promise((resolve, reject) => {
    const { clientID } = data;
    const Schema = schemas[schema];
    let formattedData = JSON.parse(JSON.stringify(data));
    if (duplicate) formattedData = _.omit(formattedData, ['_id']);

    return countEntries(Schema, clientID)
      .then((count) => {
        const item = new Schema(formattedData);
        item.order = count;
        item.save((err, doc) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          return resolve(doc);
        });
      }).catch(err => ({ success: false, err }));
  });

const updateCard = (schema, data) =>
  new Promise((resolve, reject) => {
    const { _id } = data;
    const Schema = schemas[schema];
    Schema.findOneAndUpdate({ _id }, data, { upsert: true, new: true }, (err, doc) => {
      if (err) {
        return reject(err);
      }
      return resolve(doc);
    });
  });

const deleteCard = (schema, data) =>
  new Promise((resolve, reject) => {
    const { _id } = data;
    const Schema = schemas[schema];
    Schema.find({ _id }).remove((err) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

module.exports = {
  createCard,
  deleteCard,
  updateCard,
};
