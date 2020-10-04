const express = require('express');
const path = require('path');
const logger = require('morgan');
const compress = require('compression');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const multer = require('multer');

const routes = require('./routes/index');

module.exports = (db) => {
  const app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  // Passport Configuration
  app.use(session({
    secret: 'ice-cream-octo-potato',
    resave: true,
    saveUninitialized: true,
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  require('./passport/config.js')(passport); // eslint-disable-line global-require

  app.use('/backendServices', routes(db, passport));
  app.get('*', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
  });
  app.use('/public', express.static(`${__dirname}/public`));

  return app;
};
