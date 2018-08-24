const express = require('express');

const userRouter = express.Router();

// Passport login methods
const isLoggedIn = (req, res) => {
  if (req.isAuthenticated()) res.send({ loggedIn: true });
  else res.send({ loggedIn: false });
};

module.exports = (passport) => {
  userRouter.post('/register', (req, res, next) => {
    passport.authenticate('register', (err, newUser) => {
      if (err) return next(err);
      if (!newUser) res.send({ success: false });
    })(req, res, next);
  });

  userRouter.get('/isLoggedIn', (req, res, next) => isLoggedIn(req, res, next));

  userRouter.post('/login', (req, res, next) => {
    passport.authenticate('login', (err, user) => {
      if (err) {
        console.log(`error: ${err}`);
        return next(err);
      }
      if (!user) {
        console.log('error user');
        res.send({ success: false, err });
      }
      req.login(user, (loginErr) => {
        if (loginErr) {
          return next(loginErr);
        }
        res.send({ success: true });
      });
    })(req, res, next);
  });

  userRouter.get('/logout', (req, res) => {
    req.logout();
    res.end();
  });

  userRouter.get('/', (req, res) => {
    if (req.user) {
      const pubData = JSON.parse(JSON.stringify(req.user));
      delete pubData.password;
      return res.send(pubData);
    }
    return res.end();
  });

  return userRouter;
};
