const express = require('express');
const bcrypt  = require('bcrypt');
const User    = require('../models/User');

const router  = express.Router();
const bcryptSalt = 10;

// VIEW SING UP PAGE

router.get('/signup', (req, res, next) => {
  res.render('auth/signup', {
    errorMessage: ''
  });
});


// SING UP TO DB

router.post('/signup', (req, res, next) => {
  const nameInput = req.body.name;
  const emailInput = req.body.email;
  const usernameInput = req.body.username;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/signup', {
      errorMessage: 'Enter both email and password to sign up.'
    });
    return;
  }

  User.findOne({ email: emailInput }, '_id', (err, existingUser) => {
    if (err) {
      next(err);
      return;
    }

    if (existingUser !== null) {
      res.render('auth/signup', {
        errorMessage: `The email ${emailInput} is already in use.`
      });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashedPass = bcrypt.hashSync(passwordInput, salt);

    const userSubmission = {
      name: nameInput,
      email: emailInput,
      username: usernameInput,
      password: hashedPass
    };

    const theUser = new User(userSubmission);

    theUser.save((err) => {
      if (err) {
        res.render('auth/signup', {
          errorMessage: 'Something went wrong. Try again later.'
        });
        return;
      }
      req.session.currentUser = theUser;
      res.redirect('/');
    });
  });
});

// VIEW LOG IN PAGE

router.get('/login', (req, res, next) => {
  res.render('auth/login', {
    errorMessage: ''
  });
});

// MAKE LOG IN

router.post('/login', (req, res, next) => {
  const emailInput = req.body.email;
  const passwordInput = req.body.password;

  if (emailInput === '' || passwordInput === '') {
    res.render('auth/login', {
      errorMessage: 'Enter both email and password to log in.'
    });
    return;
  }

  User.findOne({ email: emailInput }, (err, theUser) => {
    if (err || theUser === null) {
      res.render('auth/login', {
        errorMessage: `There isn't an account with email ${emailInput}.`
      });
      return;
    }

    if (!bcrypt.compareSync(passwordInput, theUser.password)) {
      res.render('auth/login', {
        errorMessage: 'Invalid password.'
      });
      return;
    }

    req.session.currentUser = theUser;
    res.redirect('/');
  });
});

// LOG OUT

router.get('/logout', (req, res, next) => {
  if (!req.session.currentUser) {
    res.redirect('/');
    return;
  }

  req.session.destroy((err) => {
    if (err) {
      next(err);
      return;
    }

    res.redirect('/');
  });
});


module.exports = router;
