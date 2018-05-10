module.exports = function(db, passport) {

    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var nodemailer = require('nodemailer');
    var userSchema = require('../models/user');
    var clientSchema = require('../models/client');
    var eventSchema = require('../models/event');
    var itemSchema = require('../models/item');
    var partySchema = require('../models/party');
    var tagSchema = require('../models/tag');
    var flash = require('connect-flash');
    var mg = require('nodemailer-mailgun-transport');
    var multiparty = require('multiparty');
    var Dropbox = require('dropbox');
    var dbx = new Dropbox({accessToken: process.env.db_access});
    var fs = require('fs');

    var sortArray = function(oArr) {
        var arr = JSON.parse(JSON.stringify(oArr));
      for (var i = 0; i < arr.length; i++) {
          for (var j = 0; j < arr.length - i - 1; j++) {
              if (arr[j].order > arr[j+1].order) {
                  var temp = arr[j];
                  arr[j] = arr[j+1];
                  arr[j+1] = temp;
              }
          }
      }
      return arr;
    };

    var schemas = {'item': itemSchema, 'event': eventSchema, 'partie': partySchema, 'tag': tagSchema};

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
        if (!req.user) return res.end();
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
    router.post('/getMenus', function(req, res) {
        itemSchema.find({clientID: req.body._id},{},function(err, items) {
            if (items) {
                res.send({success: true, data: sortArray(items)});
            }
            else {
                console.log("Error: (user: ", req.user.name, ") \n", err);
                res.send({success: false, err: err});
            }
        });
    });
    router.post('/getParties', function(req, res) {
        partySchema.find({clientID: req.body._id},{},function(err, parties) {
            console.log(err, parties);
            if (parties) {
                res.send({success: true, data: parties});
            }
            else {
                console.log("Error: ", err);
                res.send({success: false, err: err});
            }
        });
    });
    router.post('/getTags', function(req, res) {
        tagSchema.find({clientID: req.body.clientID}, {}, function(err, tags) {
           if (err) {
               res.end();
           } else {
               res.send(tags);
           }
        });
    });

    router.post('/dupCard', function(req, res) {
        var schema = schemas[req.body.schema];
        var dat = JSON.parse(JSON.stringify(req.body.data));
        delete dat["_id"];

        schema.count({clientID: req.body.data.clientID}, function(err, count) {
            var item = new schema(dat);
            item.order = count;
            item.save(function(err, doc) {
                if (err) {
                    console.log("Error: (user: ", req.user.name, ") \n", err);
                    res.send({success: false, err: err});
                } else res.send({success: true, data: doc});
            });
        });

    });
    router.post('/deleteCard', function(req, res) {
        var schema = schemas[req.body.schema];
        schema.find({_id: req.body.data._id}).remove(function(err, data) {
            if (err) {
                console.log(err);
                res.send({success: false, err: err});
            }
            else res.send({success: true, data: req.body.data});
        });
    });
    router.post('/createCard', function(req, res) {
        console.log(req.body.data);
        var schema = schemas[req.body.schema];
        schema.count({clientID: req.body.data.clientID}, function(err, count) {
            var item = new schema(req.body.data);
            item.order = count;
            item.save(function(err, doc) {
                if (err) {
                    console.log("Error: (user: ", req.user.name, ") \n", err);
                    res.send({success: false, err: err});
                } else res.send({success: true, data: doc});
            });
        });
    });
    // router.post("/previewEvent", function(req, res) {
    //
    // });
    router.post('/uploadImg', function(req, res) {
       var form = new multiparty.Form();
       form.parse(req, function(err, fields, files) {
         console.log(files.file[0].originalFilename);
           fs.readFile(files.file[0].path, function(err, data) {
             console.log(files.file[0].originalFilename + "-1");
               dbx.filesUpload({ path: '/uploads/' + files.file[0].originalFilename, contents: data })
                   .then(function(dat) {
                       console.log(dat);
                       dbx.sharingCreateSharedLink({path: dat.path_lower})
                           .then(function(dat) {
                              console.log("YOYOYOYO");
                               var url = dat.url;
                               console.log(dat);
                               schemas[fields.schema].findOneAndUpdate({"_id": fields._id}, {img: url.replace("www.dropbox", "dl.dropboxusercontent")}, {upsert: true, new: true}, function(err, doc) {
                                   if (err) {
                                       console.log("Error: (user: ", req.user.name, ") \n", err);
                                       res.end();
                                   }
                                   else res.send(doc.img);
                               });
                           })
                           .catch(function(err) {
                              console.log("AYAYAYAYAY");
                              return res.end();
                           });
                   })
                   .catch(function(err) {
                       return res.end();
                   });
           });
       });
    });

    //PUT requests
    router.put("/updateCard", function(req, res) {
        var schema = schemas[req.body.schema];
        schema.findOneAndUpdate({"_id": req.body.data._id}, req.body.data, {upsert: true, new: true}, function(err, doc) {
            if (err) {
                console.log("Error: (user: ", req.user.name, ") \n", err);
                res.send({success: false, err: err});
            }
            else res.send({success: true, data: doc});
        });
    });

    return router;

}
