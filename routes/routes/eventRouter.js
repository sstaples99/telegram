const express = require('express');

const eventSchema = require('../../models/event');

const expressRouter = express.Router();

expressRouter.post('/', (req, res) => {
  eventSchema.find({ clientID: req.body.clientID }, {}, (err, events) => {
    if (events) {
      res.send({ success: true, data: events });
    } else {
      console.log(`Error: ${err}`);
      res.send({ success: false, err });
    }
  });
});

module.exports = expressRouter;
