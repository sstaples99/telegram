module.exports = function(db) {

  //load modules
  var express       = require('express');
  var path          = require('path');
  var favicon       = require('serve-favicon');
  var logger        = require('morgan');
  var compress      = require('compression');
  var cookieParser  = require('cookie-parser');
  var flash         = require('connect-flash');
  var session       = require('express-session');
  var bodyParser    = require('body-parser');
  var passport      = require('passport');

  //load routes
  var routes = require('./routes/index');

  var app = express();

  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // uncomment after placing your favicon in /public
  //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
  app.use(logger('dev'));
  app.use(compress());
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, 'public')));

  //Passport Configuration
  app.use(session({
    secret: 'ice-cream-octo-potato',
    resave: true,
    saveUninitialized: true
  }));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(flash());

  require('./passport/config.js')(passport);

  app.use('/backendServices', routes(db, passport));
  app.get('*', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
  });
  app.use('/public', express.static(__dirname + '/public'));

  // catch 404 and forward to error handler
  app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  });

  // error handlers

  // development error handler
  // will print stacktrace
  if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
      res.status(err.status || 500);
      res.render('error', {
        message: err.message,
        error: err
      });
    });
  }

  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: {}
    });
  });


  return app;
}
