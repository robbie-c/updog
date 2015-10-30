var express = require('express');
var router = express.Router();
var passport = require('passport');

var helpers = require('./helpers');
var isLoggedIn = helpers.isLoggedIn;

router.get('/', function (req, res) {
    res.reactRender('UpDog', 'IndexPage');
});

router.get('/login', function (req, res) {
    res.reactRender('Log In', 'LogInPage');
});

router.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login' // redirect back to the signup page if there is an error
}));

router.get('/signup', function (req, res) {
    res.reactRender('Sign Up', 'SignUpPage');
});

router.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup' // redirect back to the signup page if there is an error
}));

router.get('/auth/google', passport.authenticate('google', {scope: ['profile', 'email']}));

// the callback after google has authenticated the user
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/profile',
        failureRedirect: '/'
    }));

router.get('/completeprofile', isLoggedIn, function (req, res) {
    res.reactRender('Complete Profile', 'CompleteProfilePage');
});

router.get('/profile', isLoggedIn, function (req, res) {
    res.reactRender('Profile', 'ProfilePage');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});


module.exports = router;
