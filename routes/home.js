const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product')
const uuidv4 = require('uuid/v4');
var auth = require('../config/auth');
var Pusher = require('pusher');

var isUser = auth.isUser;


var pusher = new Pusher({
    appId: '667378',
    key: '658311788cfd8fac77ab',
    secret: 'b31206b176522b5c36f0',
    cluster: 'eu',
    encrypted: true
});

pusher.trigger('my-channel', 'my-event', {
    "message": "hello world"
});

router.post('/buy', (req, res) => {

    req.checkBody('fName', 'First name must have a value').notEmpty();
    req.checkBody('lName', 'TLast name must have a value').notEmpty();
    req.checkBody('address', 'Address must have a value').notEmpty();
    var errors = req.validationErrors();
    const fName = req.body.fName
    const lName = req.body.lName
    const email = req.body.email
    const address = req.body.address
    const address2 = req.body.address2
    const payment = req.body.paymentMethod
    const order = req.session.cart
    const number = req.body.number
    const notes = req.body.notes
    const order_id = uuidv4()
    console.log(payment)
    if (errors) {
        res.render('checkout', {
            errors: errors,
            title: 'Checkout',
            user: "hey"
        });
    } else {
        var newOrder = new Order({
            fName: fName,
            lName: lName,
            email: email,
            address: address,
            address2: address2,
            payment: payment,
            order: order,
            number, number,
            notes: notes,
            order_id: order_id
        });

        newOrder.save().then(
            (order) => {
                res.redirect('/cart/successful/' + order_id);
                pusher.trigger('orders', 'order1', {
                    order: order
                });
        }
        )
    }

})

var sent

//  GET add product to cart
router.get('/', function (req, res) {
    res.render('home', {
            cart: req.session.cart,
            user: isUser
        });
        console.log(isUser)
});

module.exports = router;
