// config/passport.js

var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var logger = require('../../common/logger');

var config = require('../../config');
import User from '../models/user';

var initializedPassports = new Set();

// expose this function to our app using module.exports
module.exports = function (passport) {
    if (initializedPassports.has(passport)) {
        return;
    }
    initializedPassports.add(passport);

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use('local-signup', new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, email, password, done) {

                process.nextTick(function () {

                    // find a user whose email is the same as the forms email
                    // we are checking to see if the user trying to login already exists
                    User.findOne({'local.email': email}, function (err, user) {
                        // if there are any errors, return the error
                        if (err)
                            return done(err);

                        // check to see if theres already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        } else {

                            // if there is no user with that email
                            // create the user
                            var newUser = new User();

                            // set the user's local credentials
                            newUser.local.email = email;
                            newUser.local.password = newUser.generateHash(password);

                            // save the user
                            newUser.save(function (err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }

                    });

                });
            })
    );

    passport.use('local-login', new LocalStrategy({
                // by default, local strategy uses username and password, we will override with email
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // allows us to pass back the entire request to the callback
            },
            function (req, email, password, done) { // callback with email and password from our form

                // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.findOne({'local.email': email}, function (err, user) {
                    // if there are any errors, return the error before anything else
                    if (err)
                        return done(err);

                    // if no user is found, return the message
                    if (!user) {
                        logger.info('No user found');
                        return done(null, false);
                    }

                    // if the user is found but the password is wrong
                    if (!user.validPassword(password)) {
                        logger.info('Password wrong');
                        return done(null, false);
                    }

                    // all is well, return successful user
                    return done(null, user);
                });

            })
    );

    passport.use(new GoogleStrategy({
            clientID: config.googleAuth.clientId,
            clientSecret: config.googleAuth.clientSecret,
            callbackURL: config.googleAuth.callbackURL
        },
        function (token, refreshToken, profile, done) {

            // apparently this needs to be wrapped, tutorial did not explain why
            process.nextTick(function () {

                // try to find the user based on their google id
                User.findOne({'google.id': profile.id}, function (err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        // if a user is found, log them in
                        return done(null, user);
                    } else {
                        // if the user isn't in our database, create a new user
                        var newUser = new User();

                        // set all of the relevant information
                        newUser.google.id = profile.id;
                        newUser.google.token = token;
                        newUser.google.name = profile.displayName;
                        newUser.google.email = profile.emails[0].value; // pull the first email

                        // save the user
                        newUser.save(function (err) {
                            if (err)
                                throw err;
                            return done(null, newUser);
                        });
                    }
                });
            });

        }));

};
