var express = require('express');
var router = express.Router();
var passport = require('passport');
const pp = require('../config/passport')
var bcrypt = require('bcryptjs');
var Order = require('../models/order');
var auth = require('../config/auth');
var isUser = auth.isUser;

var User = require('../models/user');

router.get('/orders', isUser, function (req, res) {
    const d = new Date();
    const time = d.getHours().toLocaleString();
    const user = res.locals.user
    Order.find({ email: user.email} ,function (error, lOrder) {
        if (error)
            return console.log(error);
        res.render('userOrders', {
            title: 'Orders',
            date: time,
            lOrder: lOrder
        });
    });
});

router.get('/order/:id', isUser, function (req, res) {
    Order.findOne({ order_id: req.params.id}, function (error, order) {
        if (error)
            return console.log(error);
        const user = res.locals.user
        Order.find({ email: user.email }, function (error, lOrder) {
            if (error)
                return console.log(error);

            res.render('userOrder', {
                title: 'title',
                order: order,
                lOrder: lOrder
            });
        });
    });
});

//  GET register an user
router.get('/register', function (req, res) {
    res.render('register', {
        title: 'Register'
    });
});

//  POST register an user
router.post('/register', function (req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var confirm = req.body.confirm_password;

    req.checkBody('name', 'Name is required!!').notEmpty();
    req.checkBody('email', 'Email is required!!').isEmail();
    req.checkBody('username', 'Username is required!!').notEmpty();
    req.checkBody('password', 'Password is required!!').notEmpty();
    req.checkBody('confirm_password', 'Passwords do not match!!').equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            title: 'Register',
            errors: errors,
            user: null
        });
    } else {
        User.findOne({ username: username }, function (error, user) {
            if (error) {
                console.log(error);
            }

            if (user) {
                req.flash('danger', 'Username exists, choose another.');
                res.redirect('/user/register');
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password: password,
                    admin: 0
                });

                bcrypt.genSalt(10, function (error, salt) {
                    bcrypt.hash(user.password, salt, function (error, hash) {
                        if (error)
                            console.log(error);

                        user.password = hash;
                        user.save(function (error) {
                            if (error) {
                                console.log(error);
                            } else {
                                req.flash('success', 'You are now registered');
                                res.redirect('/user/login');
                            }
                        });
                    });
                });
            }
        });
    }
});

//  GET login
router.get('/login', function (req, res) {
    if (res.locals.user)
        res.redirect('/');

    res.render('login', {
        title: 'Log - in'
    });
});

//  POST login
router.post('/login', function (req, res, next) {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/user/login',
        failureFlash: true
    })(req, res, next);
});

//  GET logout
router.get('/logout', function (req, res) {

    req.logout();

    req.flash('success', 'You are logged out');
    res.redirect('/user/login');
});

module.exports = router;
