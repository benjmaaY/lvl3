var express = require('express');
var router = express.Router();
var Product = require('../models/product');




//  GET clear cart
router.get('/clear', function (req, res) {
    delete req.session.cart;

    req.flash('success', 'Cart cleared!!');
    res.redirect('/cart/checkout');
});

//  GET buy now
router.get('/buynow', function (req, res) {
    delete req.session.cart;
    res.sendStatus(200);
});

router.post('/buynow', function (req, res) {
    var fName = req.body.fName;
    var lName = req.body.lName;
    var email = req.body.email;
    var address = req.body.address;
    console.log('wtf ' + fName)
    var confirm = req.body.confirm_password;

});

module.exports = router;
