const express = require('express');

const partySchema = require('../../models/party');

const partiesRouter = express.Router();

partiesRouter.post('/', (req, res) => {
  partySchema.find({ clientID: req.body._id }, {}, (err, parties) => {
    if (parties) {
      res.send({ success: true, data: parties });
    } else {
      res.send({ success: false, err });
    }
  });
});

module.exports = partiesRouter;
