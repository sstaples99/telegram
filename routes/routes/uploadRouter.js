const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const {
  readFile,
} = require('../utilities/utilities');
const {
  uploadToAWSAndGetShareLink,
  uploadToDropboxAndGetShareLink,
} = require('../controllers/upload');

const uploadRouter = express.Router();

uploadRouter.post('/img', upload.single('file'), (req, res) => {
  console.log("file", req.file);
  console.log(req.body);
  readFile(req.file.path)
    .then(data => uploadToAWSAndGetShareLink(`uploads/${req.file.originalname}`, data))
    .then(result => res.send({ success: true, data: result }))
    .catch(err1 => res.send({ success: false, err: err1 }));
});

module.exports = uploadRouter;
