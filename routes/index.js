module.exports = function(db, passport) {

    var express = require('express');
    var router = express.Router();
    var bodyParser = require('body-parser');
    var nodemailer = require('nodemailer');
    var userSchema = require('../models/user');
    var clientSchema = require('../models/client');
    var eventSchema = require('../models/event');
    var itemSchema = require('../models/item');
    var flash = require('connect-flash');
    var mg = require('nodemailer-mailgun-transport');

    //prototypes
    Array.prototype.move = function(oidx, nidx) {
        var oi = this.splice(oidx, 1);
        this.splice(nidx, 0, oi[0]);
    };

    //custom methods
    var createSentinal = function(schema, clientID) {
        var n = new schema({clientID: clientID, title: "Sentinal Node"});
        n.prev = n._id;
        n.next = n._id;
        n.head = n._id;
        n.save();
        return n;
    };
    var createLinkedDoc = function(schema, vals, req, res) {
        schema.count({}, function(err, count) {
            if (err) {
                console.log("Error counting documents (create)", err);
                return res.end();
            }
            if (count == 0) {
                var head = createSentinal(schema, vals.clientID);
                var i = new schema({clientID: vals.clientID, prev: head.prev, next: head._id, head: head._id});
                head.next = i._id;
                head.prev = i._id;
                i.save();
                head.save();
                return res.send(i);
            } else {
                if (vals.head) {
                    schema.findOne({_id: vals.head}, function(err, doc) {
                        if (err) {
                            console.log("Error finding head (create)", err);
                            return res.end();
                        }
                        var head = doc;
                        vals.prev = head.prev;
                        vals.next = head._id;
                        vals.head = head._id;
                        var i = new schema(vals);
                        schema.findById(head.prev, function(err, p) {
                            if (err) {
                                console.log("Error finding last element (create)", err);
                                return res.end();
                            }
                            p.next = i._id;
                            head.prev = i._id;
                            i.save();
                            p.save();
                            head.save();
                            return res.send(i);
                        });
                    });
                } else {
                    schema.findOne({clientID: vals.clientID}, function(err, r) {
                        if (err) {
                            console.log("Error loading docs (create)", err);
                            return res.end();
                        }
                       schema.findById(r.head, function(err, doc) {
                           if (err) {
                               console.log("Error finding head (create)", err);
                               return res.end();
                           }
                           var head = doc;
                           vals.prev = head.prev;
                           vals.next = head._id;
                           vals.head = head._id;
                           var i = new schema(vals);
                           schema.findById(head.prev, function(err, p) {
                               if (err) {
                                   console.log("Error finding last element (create)", err);
                                   return res.end();
                               }
                               p.next = i._id;
                               head.prev = i._id;
                               i.save();
                               p.save();
                               head.save();
                               return res.send(i);
                           });
                       });
                    });
                }
            }
        });
    };
    var deleteLinkedDoc = function(schema, id, req, res) {
        schema.findById(id, function(err, doc) {
            if (err) {
                console.log("Error finding item to delete", err);
                return res.end();
            }
            var prev = doc.prev;
            var next = doc.next;
            schema.findById(prev, function(err, p) {
                if (err) {
                    console.log("Error finding previous link to delete", err);
                    return res.end();
                }
                schema.findById(next, function(err, n) {
                    if (err) {
                        console.log("Error finding next link to delete", err);
                        return res.end();
                    }
                    p.next = next;
                    n.prev = prev;
                    p.save();
                    n.save();
                    doc.remove();
                    return res.send(true);
                });
            });
        });
    };
    var moveLinkedDoc = function(schema, id, prev, req, res) {
        schema.findById(id, function(err, doc) {
            if (err) {
                console.log("Error finding item to move", err);
                return res.end();
            }
            schema.findById(doc.prev, function(err, fPrev) {
                if (err) {
                    console.log("Error finding prev item to move");
                    return res.end();
                }
                schema.findById(doc.next, function(err, fNext) {
                    if (err) {
                        console.log("Error finding next item to move");
                        return res.end();
                    }

                    fPrev.next = fNext._id;
                    fNext.prev = fPrev._id;

                    schema.findById(prev, function(err, nPrev) {
                        if (err) {
                            console.log("Error finding new prev item to move");
                            return res.end();
                        }
                        schema.findById(nPrev.next, function(err, nNext) {
                            if (err) {
                                console.log("Error finding new next item to move");
                                return res.end();
                            }
                            doc.prev = nPrev._id;
                            doc.next = nPrev.next;
                            nPrev.next = doc._id;
                            nNext.prev = doc._id;
                            fPrev.save();
                            fNext.save();
                            doc.save();
                            nPrev.save();
                            nNext.save();
                            return res.send(true);
                        });
                    });
               });
            });
        });
    };

    var orderLinkedList = function(list) {

        //O(n^2) complexity :(

        if (list.length < 1) return [];

        var head = list.find(function(o) {return o._id.toString() === list[0].head});
        var ordered = [];
        var n = head;
        while (n.next !== head._id.toString()) {
            n = list.find(function(o) {return o._id.toString() == n.next});
            ordered.push(n);
        }
        return ordered;
    };

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
    router.post('/dupEvent', function(req, res) {
        var dat = JSON.parse(JSON.stringify(req.body));
        delete dat["_id"];
        var ev = new eventSchema(dat);

        ev.save(function(err, doc) {
          if (err) {
              console.log("Error: (user: ", req.user.name, ") \n", err);
              res.send({success: false, err: err});
          } else res.send({success: true, data: doc});
        });
    });
    router.post('/deleteEvent', function(req, res) {
        eventSchema.find({_id: req.body._id}).remove(function(err, data) {
            if (err) {
                console.log(err);
                res.send({success: false, err: err});
            }
            else res.send({success: true, data: req.body});
        });
    });
    router.post('/getMenus', function(req, res) {
        itemSchema.find({clientID: req.body._id},{},function(err, items) {
           if (items) {
               var ordered = orderLinkedList(items);
               res.send({success: true, data: ordered});
           }
           else {
               console.log("Error: (user: ", req.user.name, ") \n", err);
               res.send({success: false, err: err});
           }
        });
    });
    router.post('/dupItem', function(req, res) {
        var dat = JSON.parse(JSON.stringify(req.body));
        delete dat["_id"];
        delete dat["order"];
        createLinkedDoc(itemSchema, dat, req, res);
    });
    router.post('/deleteItem', function(req, res) {
        deleteLinkedDoc(itemSchema, req.body._id, req, res);
    });
    router.post('/createEvent', function(req, res) {
        var i = new eventSchema({clientID: req.body.clientID});
        i.save(function(err, doc) {
            console.log(doc);
            if (err) console.log(err);
            else res.send({success: true, data: doc});
        });
    });
    router.post('/createItem', function(req, res) {
        createLinkedDoc(itemSchema, {clientID: req.body.clientID}, req, res);
    });
    router.post('/reorderItem', function(req, res) {
        console.log("REORDER ----------------");
        moveLinkedDoc(itemSchema, req.body._id, req.body.prev, req, res);
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
    router.put("/updateItem", function(req, res) {
        itemSchema.findOneAndUpdate({"_id": req.body._id}, req.body, {upsert: true, new: true}, function(err, doc) {
            if (err) {
                console.log("Error: (user: ", req.user.name, ") \n", err);
                res.send({success: false, err: err});
            }
            else res.send({sucess: true, data: doc});
        });
    });

    return router;

}
