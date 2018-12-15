var express = require('express');
var router = express.Router();
var fs = require('fs-extra');
var auth = require('../config/auth');
var Product = require('../models/product');
var Category = require('../models/category');

var isUser = auth.isUser;

//  GET retrieve all products
router.get('/all', isUser, function (req, res) {
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
                byC: false
            });
        });
     })
    
});

//  GET retrieve a product by category
router.get('/:category', isUser, function (req, res) {
    var here = true
    var categorySlug = req.params.category;

    Category.findOne({ slug: categorySlug }, function (error, category) {
        Product.find({ category: categorySlug }, function (error, products) {

            Product.count({ category: categorySlug }, function (err, count2) {
                Product.count({}, function (err, countA) {
                if (error)
                    console.log(error);
                console.log(count2)
                res.render('category_products', {
                    title: category.title,
                    products: products,
                    count2: count2,
                    byC : true,
                    here: true,
                    c: countA
                });
                });
            });
        });
    });
});

//  GET retrieve a product details
router.get('/:category/:product', isUser, function (req, res) {
    var here = true
    var galleryImages = null;
    var loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({ slug: req.params.product }, function (error, product) {
        if (error) {
            console.log(error);
        } else {
            var galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (error, files) {
                if (error) {
                    console.log(error);
                } else {
                    console.log(req.params.category)
                    galleryImages = files;
                    res.render('product', {
                        title: product.title,
                        product: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn,
                        cat: req.params.category
                    });
                }
            });
        }
    });
});

module.exports = router;
