var express = require('express');
var router = express.Router();
var Page = require('../models/page');
const Product = require('../models/product')
var auth = require('../config/auth');
var isUser = auth.isUser;




//  GET retrieve all pages


router.get('/', isUser ,function (req, res) {
    var here = true
    Product.count({}, function (err, count) {
        console.log(count)
        var c = count
        Product.find(function (error, products) {
            if (error)
                console.log(error);

            res.render('all_products', {
                title: 'All products',
                products: products,
                here: here,
                c: c,
                byC: true
            });
        });
    })
});

//  GET retrieve a page content
router.get('/:slug', function (req, res) {
    var here = false
    var slug = req.params.slug;

    Page.findOne({ slug: slug }, function (error, page) {
        if (error)
            console.log(error);

        if (!page) {
            res.redirect('/');
        } else {
            res.render('index', {
                title: page.title,
                content: page.content,
                here: here
            });
        }
    });
});

module.exports = router;
