const express = require('express');
const multiparty = require('multiparty');

const {
  readFile,
} = require('../utilities/utilities');
const {
  uploadToDropboxAndGetShareLink,
} = require('../controllers/upload');

const uploadRouter = express.Router();

uploadRouter.post('/img', (req, res) => {
  const form = new multiparty.Form();
  let files;
  form.parse(req, (err, fields, filesIn) => {
    if (err) {
      return res.send({ success: false, err });
    }
    files = filesIn;
    console.log(files);
    readFile(files.file[0].path)
      .then(data => uploadToDropboxAndGetShareLink(`/uploads/${files.file[0].originalFilename}`, data))
      .then(result => res.send({ success: true, data: result }))
      .catch(err1 => res.send({ success: false, err: err1 }));
  });
});

module.exports = uploadRouter;
