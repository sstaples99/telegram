const express = require('express');
const {
  createCard,
  deleteCard,
  updateCard,
} = require('../controllers/card');

const cardRouter = express.Router();

cardRouter.post('/', (req, res) =>
  createCard(req.body.schema, req.body.data)
    .then(results => res.send({ success: true, data: results }))
    .catch(err => res.send({ success: false, err })));

cardRouter.post('/duplicate', (req, res) =>
  createCard(req.body.schema, req.body.data, true)
    .then(results => res.send({ success: true, data: results }))
    .catch(err => res.send({ success: false, err })));

cardRouter.put('/', (req, res) =>
  updateCard(req.body.schema, req.body.data)
    .then(results => res.send({ success: true, data: results }))
    .catch(err => res.send({ success: false, err })));

cardRouter.post('/delete', (req, res) =>
  deleteCard(req.body.schema, req.body._id)
    .then(results => res.send({ success: true, data: results }))
    .catch(err => res.send({ success: false, err })));

module.exports = cardRouter;
