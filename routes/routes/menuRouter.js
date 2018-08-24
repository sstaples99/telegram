const express = require('express');
const {
  createSubmenu,
  deleteSubmenu,
  findAllMenus,
  findAllMenuItems,
} = require('../controllers/menu');

const menuRouter = express.Router();

menuRouter.post('/submenu', (req, res) =>
  createSubmenu(req.body.menuID, req.body.submenuText)
    .then(() => res.send({ success: true }))
    .catch(err => res.send({ success: false, err })));

menuRouter.post('/submenu/delete', (req, res) =>
  deleteSubmenu(req.body.menuID, req.body.submenuText)
    .then(() => res.send({ success: true }))
    .catch(err => res.send({ success: false, err })));

menuRouter.post('/', (req, res) =>
  findAllMenus(req.body.clientID)
    .then(tags => res.send({ success: true, data: tags }))
    .catch(err => res.send({ success: false, err })));

menuRouter.post('/items', (req, res) =>
  findAllMenuItems(req.body.clientID)
    .then(items => res.send({ success: true, data: items }))
    .catch(err => res.send({ success: false, err })));

module.exports = menuRouter;
