var express = require('express');
var router = express.Router();
var auth = require('../config/auth');
var Pusher = require('pusher');
const Nexmo = require("nexmo");

var Order = require('../models/order');
var isAdmin = auth.isAdmin;

const nexmo = new Nexmo(
    {
        apiKey: "c1ba12aa",
        apiSecret: "oWlY755ZHmgddwyC"
    },
    { debug: true }
);


//  GET category
router.get('/orders', isAdmin, function (req, res) {
    Order.find(function (error, orders) {
        if (error)
            return console.log(error);
        
        res.render('admin/orders', {
            title: 'Orders',
            orders: orders
        });
    });
});

router.get('/confirm/:number/:id', (req, res) => {
    console.log(req.body)
    res.render('admin/confirm', {
        title: 'Confirm',
        number: req.params.number,
        id: req.params.id
    });
});

router.post('/confirm', (req, res) => {
    // res.send(req.body)
    console.log(req.body)
    const number = '216' + req.body.number    
    const text = req.body.text
    const time = req.body.time
    const sms = 'Your order is confirmed and should be ready at ' + time + '! Restaurent notes:' + text

    nexmo.message.sendSms(
        'GOMYCODE Project', number, sms, { type: 'unicode' },
        (err, responseData) => {
            if (err) {
                console.log(err)
            } else {
                console.dir(responseData)
                // get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

            }
        }
    )
});
router.post('/decline', (req, res) => {
    // res.send(req.body)
    console.log(req.body)
    const number = '216' + req.body.number
    const text = req.body.text
    const sms = "Your order is declined .Restaurent notes:" + text;

    nexmo.message.sendSms(
        'GOMYCODE Project', number, sms, { type: 'unicode' },
        (err, responseData) => {
            if (err) {
                console.log(err)
            } else {
                console.dir(responseData)
                // get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

            }
        }
    )
});
router.get('/:id', isAdmin ,function (req, res) {
    Order.findById(req.params.id, function (error, order) {
        if (error)
            return console.log(error);

        res.render('admin/order', {
            title: 'title',
            order: order,
        });
    });
});

router.post('/orders/search', function (req, res) {
    var orderi = req.body.orderi
    console.log(orderi)

    Order.findOne({ order_id: orderi }, function (error, order) {

        if (error)
            return console.log(error);

        if (order !== null) {
            console.log(order)
            res.render('admin/order', {
                title: 'title',
                order: order,
            });
        } else {

            req.flash('danger', 'Order not found or ID is incorrect...');
            res.redirect('/adminorders/orders');
            
        }
    });
    
});

//  GET add category
router.get('/add', isAdmin, function (req, res) {
    var title = 'New category';

    res.render('admin/add-category', {
        title: title
    });
});

//  POST add category
router.post('/add', function (req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add-category', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({ slug: slug }, function (error, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');

                res.render('admin/add-category', {
                    title: title
                });
            } else {
                var newCategory = new Category({
                    title: title,
                    slug: slug
                });

                newCategory.save(function (error) {
                    if (error)
                        return console.log(error);

                    Category.find(function (error, categories) {
                        if (error)
                            console.log(error);
                        else
                            req.app.locals.categories = categories;
                    });

                    req.flash('success', 'Category added!!');
                    res.redirect('/adminCategories/categories');
                });
            }
        });
    }
});

//  GET edit category
router.get('/edit/:id', isAdmin, function (req, res) {
    Category.findById(req.params.id, function (error, category) {
        if (error)
            return console.log(error);

        res.render('admin/edit-category', {
            title: category.title,
            id: category._id
        });
    });
});

//  POST edit category
router.post('/edit/:id', function (req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();

    var title = req.body.title;
    var slug = title.replace(/\s+/g, '-').toLowerCase();
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit-category', {
            errors: errors,
            title: title,
            slug: slug,
            id: id
        });
    } else {
        Category.findOne({ slug: slug, _id: { '$ne': id } }, function (error, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');

                res.render('admin/edit-category', {
                    title: title,
                    slug: slug,
                    id: id
                });
            } else {
                Category.findById(id, function (error, category) {
                    if (error)
                        return console.log(error);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (error) {
                        if (error)
                            return console.log(error);

                        Category.find(function (error, categories) {
                            if (error)
                                console.log(error);
                            else
                                req.app.locals.categories = categories;
                        });

                        req.flash('success', 'Category edited!!');
                        res.redirect('/adminCategories/edit/' + category._id);
                    });
                });
            }
        });
    }
});

//  DELETE delete category
router.get('/delete/:id', isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (error) {
        if (error)
            return console.log(error);

        Category.find(function (error, categories) {
            if (error)
                console.log(error);
            else
                req.app.locals.categories = categories;
        });

        req.flash('success', 'Category deleted!!');
        res.redirect('/adminCategories/categories');
    });
});

module.exports = router;
