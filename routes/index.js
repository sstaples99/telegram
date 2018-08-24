const express = require('express');
const {
  cardRouter,
  eventRouter,
  menuRouter,
  organizationRouter,
  partyRouter,
  uploadRouter,
} = require('./routes');


const router = express.Router();

module.exports = (db, passport) => {
  require('../passport/config.js')(passport); // eslint-disable-line global-require
  const userRouter = require('./routes/userRouter')(passport); // eslint-disable-line global-require

  router.use('/card', cardRouter);
  router.use('/event', eventRouter);
  router.use('/menu', menuRouter);
  router.use('/organization', organizationRouter);
  router.use('/party', partyRouter);
  router.use('/upload', uploadRouter);
  router.use('/user', userRouter);

  return router;
};
