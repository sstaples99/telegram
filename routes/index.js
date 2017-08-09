module.exports = function(db, passport) {

  var express = require('express');
  var router = express.Router();
  var bodyParser = require('body-parser');
  var nodemailer = require('nodemailer');
  var userSchema = require('../models/user');
  var clientSchema = require('../models/client');
  var eventSchema = require('../models/event');
  var flash = require('connect-flash');
  var mg = require('nodemailer-mailgun-transport');

  //Passport login methods
  var LocalStrategy = require('passport-local').Strategy;
  require('../passport/config.js')(passport);
  router.post('/register', function(req, res, next) {
      passport.authenticate('register', function(err, newUser, info) {
        if (err) return next(err);
        if (!newUser) res.send({success: false});
      })(req,res,next);
  });

  var isLoggedIn = function(req, res, next) {
    if (req.isAuthenticated()) res.send({loggedIn: true});
    else res.send({loggedIn: false});
  }

  router.post('/login', function(req, res, next) {
    passport.authenticate('login', function(err, user, info) {
      if (err) {
        console.log("error: ", err);
        return next(err);
      }
      if (!user) {
        console.log("error user");
        res.send({success: false, err: err});
      }
      req.login(user, function(loginErr) {
          if(loginErr) {
              return next(loginErr);
          }
          res.send({success: true});
      })
    })(req, res, next);
  });

  router.get('/logout', function(req, res, next) {
      req.logout();
      res.end();
  });

  router.get('/getEvents', function(req, res) {
    var clientID = req.user.clientID;
    eventSchema.find({clientID: clientID},{}, {sort: {"start": -1}}, function(err, events) {
      if (events) res.send({success: true, data: events});
      else res.send({success: false, err: err});
    });
  });



  return router;

}
