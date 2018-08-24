const express = require('express');

const {
  parseForm,
  readFile,
} = require('../utilities/utilities');
const {
  uploadToDropboxAndGetShareLink,
} = require('../controllers/upload');

const uploadRouter = express.Router();

uploadRouter.post('/img', (req, res) => {
  let files;
  parseForm(req)
    .then((fields, filesIn) => {
      files = filesIn;
      readFile(files.file[0].path);
    })
    .then(data => uploadToDropboxAndGetShareLink(`/uploads/${files.file[0].originalFilename}`, data))
    .then(result => res.send({ success: true, data: result }))
    .catch(err => res.send({ success: false, err }));
});

module.exports = uploadRouter;
