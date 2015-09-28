var express = require('express');
var router = express.Router();
var passport = require('passport');

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

router.get('/profile', isLoggedIn, function (req, res) {
    res.reactRender('Profile', 'ProfilePage');
});

router.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

module.exports = router;
