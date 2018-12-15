var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var bcrypt = require('bcryptjs');

module.exports = function (passport) {
    passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({ username: username }, function (error, user) {
            if (error)
                console.log(error);

            if (!user)
                return done(null, false, { message: 'No user found' });

            bcrypt.compare(password, user.password, function (error, isMatch) {
                if (error)
                    console.log(error);

                if (isMatch)
                    return done(null, user);
                else
                    return done(null, false, { message: 'Wrong password' });
            });
        });
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (error, user) {
            done(error, user);
        });
    });
}
