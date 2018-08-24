const Dropbox = require('dropbox');

const dbx = new Dropbox({ accessToken: process.env.db_access });

const uploadToDropboxAndGetShareLink = (path, contents) =>
  dbx.filesUpload({ path, contents })
    .then(dat => dbx.sharingCreateSharedLink({ path: dat.path_lower }))
    .catch(() => Promise.reject());

module.exports = { uploadToDropboxAndGetShareLink };
