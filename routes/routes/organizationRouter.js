const express = require('express');
const _ = require('lodash');
const clientSchema = require('../../models/client');

const organizationsRouter = express.Router();

organizationsRouter.get('/', (req, res) => {
  if (!req.user) return res.end();
  const ids = req.user.clientIDs;
  const promises = _.map(ids, id => clientSchema.findById(id));
  Promise.all(promises)
    .then((vals) => {
      res.send(vals);
    });
});

module.exports = organizationsRouter;
