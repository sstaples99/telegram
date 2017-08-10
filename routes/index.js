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
    var isLoggedIn = function(req, res, next) {
        if (req.isAuthenticated()) res.send({loggedIn: true});
        else res.send({loggedIn: false});
    };
    require('../passport/config.js')(passport);
    router.post('/register', function(req, res, next) {
      passport.authenticate('register', function(err, newUser, info) {
        if (err) return next(err);
        if (!newUser) res.send({success: false});
      })(req,res,next);
    });
    router.get('/isLoggedIn', function(req, res, next) {
        return isLoggedIn(req, res, next);
    });
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
                } else {
                    res.send({success: true});
                }
            });
        })(req, res, next);
    });
    router.get('/logout', function(req, res, next) {
        req.logout();
        res.end();
    });


    //GET requests
    router.get('/getUser', function(req, res) {
       if (req.user) {
           var pubData = JSON.parse(JSON.stringify(req.user));
           delete pubData.password;
           res.send(pubData);
       } else res.end();
    });
    router.get('/getOrgs', function(req, res) {
        var ids = req.user.clientIDs;
        var promises = [];
        for (var i = 0; i < ids.length; i++) promises.push(clientSchema.findById(ids[i]));
        Promise.all(promises)
            .then(function(vals) {
                res.send(vals);
            });
    });

    //POST requests
    router.post('/getEvents', function(req, res) {
        eventSchema.find({clientID: req.body._id},{},function(err, events) {
           if (events) {
               res.send({success: true, data: events});
           }
           else {
               console.log("Error: ", err);
               res.send({success: false, err: err});
           }
        });
    });

    //PUT requests
    router.put("/updateEvent", function(req, res) {
       eventSchema.findOneAndUpdate({"_id": req.body._id}, req.body, {upsert: true, new: true}, function(err, doc) {
          if (err) {
              console.log("Error: (user: ", req.user.name, ") \n", err);
              res.send({success: false, err: err});
          }
          else res.send({sucess: true, data: doc});
       });
    });

    return router;

}
