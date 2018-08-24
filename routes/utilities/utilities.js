const fs = require('fs');
const multiparty = require('multiparty');

const parseForm = req =>
  new Promise((resolve, reject) => {
    const form = new multiparty.Form();
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      resolve(fields, files);
    });
  });

const readFile = path =>
  new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve(data);
    });
  });

const countEntries = (Schema, clientID) =>
  new Promise((resolve, reject) => {
    Schema.count({ clientID }, (err, count) => {
      if (err) {
        return reject(err);
      }
      return resolve(count);
    });
  });

module.exports = {
  countEntries,
  parseForm,
  readFile,
};
