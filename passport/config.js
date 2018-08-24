const LocalStrategy = require('passport-local');
// require('passport-remember-me');
const User = require('../models/user');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use('register', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, (req, email, password, done) => {
    process.nextTick(() => {
      User.findOne({ email }, (err, user) => {
        if (err) {
          console.log(err);
          return done(err);
        }
        if (user) {
          console.log('Email already in use');
          return done(null, false, req.flash({ message: 'Email already in use' }));
        }
        const newUser = new User();
        newUser.email = email;
        newUser.password = newUser.generateHash(password);

        newUser.save((err1) => {
          if (err1) {
            console.log(`Error in registration: ${err1}`);
            done(null, false, req.flash({ message: 'Save Error.' }));
          } else {
            console.log('User registration successful!');
            return done(null, newUser);
          }
        });
        return done(null, newUser);
      });
    });
  }));

  passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
  }, (req, email, password, done) => {
    User.findOne({ email }, (err, user) => {
      if (err) return done(err);
      if (!user) return done(null, false, req.flash('loginMessage', 'No user found'));
      if (!user.validPassword(password)) return done(null, false, req.flash, ('loginMessage', 'Incorrect Password'));
      return done(null, user);
    });
  }));
};
