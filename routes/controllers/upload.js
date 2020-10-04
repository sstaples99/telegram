const AWS = require('aws-sdk');
const Dropbox = require('dropbox');

AWS.config.update({ region: 'us-east-2' });

const dbx = new Dropbox({ accessToken: process.env.db_access });
const s3 = new AWS.S3({apiVersion: '2006-03-01'});

const uploadToDropboxAndGetShareLink = (path, contents) =>
  dbx.filesUpload({ path, contents })
    .then(dat => {
      return dbx.sharingCreateSharedLink({ path: dat.path_lower })})
    .catch(() => Promise.reject());

const uploadToAWSAndGetShareLink = (path, contents) =>
  new Promise((resolve, reject) => {
    console.log(path, contents);
    s3.upload({
      Bucket: 'telegram-storage',
      Key: path,
      Body: contents
    }, (err, data) => {
      if (err) {
        console.log("Error:", err);
        reject(err);
      } else {
        console.log("Success:", data.Location);
        resolve(data.Location);
      }
    });
  });

module.exports = {
  uploadToAWSAndGetShareLink,
  uploadToDropboxAndGetShareLink
};
