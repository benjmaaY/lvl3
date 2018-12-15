var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');
var auth = require('../config/auth');

var Product = require('../models/product');
var Category = require('../models/category');

var isAdmin = auth.isAdmin;

//  GET product
router.get('/products', isAdmin, function (req, res) {
    var count = 0;

    Product.count(function (error, c) {
        count = c;
    });

    Product.find(function (error, products) {
        res.render('admin/products', {
            title: 'All products',
            count: count,
            products: products
        });
    });
});

//  GET add product
router.get('/add', isAdmin, function (req, res) {

    var title = 'New product';
    var description = '';
    var price = '';

    Category.find(function (error, categories) {
        res.render('admin/add-product', {
            title: title,
            description: description,
            price: price,
            category: categories
        });
    });
});

//  POST add product
router.post('/add', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('description', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = slug = title.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var price = req.body.price;
    var category = req.body.category;

    var errors = req.validationErrors();

    if (errors) {
        Category.find(function (error, categories) {
            res.render('admin/add-product', {
                errors: errors,
                title: title,
                description: description,
                price: price,
                category: categories
            });
        });
    } else {
        Product.findOne({ slug: slug }, function (error, product) {
            if (product) {
                req.flash('danger', 'Product title exists, choose another.');

                Category.find(function (error, categories) {
                    res.render('admin/add-product', {
                        title: title,
                        description: description,
                        price: price,
                        category: categories
                    });
                });
            } else {
                var price2 = parseFloat(price).toFixed(2);

                var newProduct = new Product({
                    title: title,
                    slug: slug,
                    description: description,
                    price: price2,
                    category: category,
                    image: imageFile
                });

                newProduct.save(function (error) {
                    if (error)
                        return console.log(error);

                    mkdirp('public/product_images/' + newProduct._id, function (error) {
                        return console.log(error);
                    });

                    mkdirp('public/product_images/' + newProduct._id + '/gallery', function (error) {
                        return console.log(error);
                    });

                    mkdirp('public/product_images/' + newProduct._id + '/gallery/thumbs', function (error) {
                        return console.log(error);
                    });

                    if (imageFile != "") {
                        var productImage = req.files.image;
                        var path = 'public/product_images/' + newProduct._id + '/' + imageFile;

                        productImage.mv(path, function (error) {
                            return console.log(error);
                        });
                    }

                    req.flash('success', 'Product added!!');
                    res.redirect('/adminProducts/products');
                });
            }
        });
    }
});

//  GET edit product
router.get('/edit/:id', isAdmin, function (req, res) {

    var errors;

    if (req.session.errors)
        errors = req.session.errors;

    req.session.errors = null;

    Category.find(function (error, categories) {
        Product.findById(req.params.id, function (error, product) {
            if (error) {
                console.log(error);
                res.redirect('/adminProducts/products');
            }
            else {
                var galleryDir = 'public/product_images/' + product._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function (error, files) {
                    if (error) {
                        console.log(error);
                    } else {
                        galleryImages = files;

                        res.render('admin/edit-product', {
                            errors: errors,
                            id: product._id,
                            title: product.title,
                            description: product.description,
                            price: parseFloat(product.price).toFixed(2),
                            catId: product.category.replace(/\s+/g, '-').toLowerCase(),
                            category: categories,
                            image: product.image,
                            galleryImages: galleryImages
                        });
                    }
                });
            }
        });
    });
});

//  POST edit product
router.post('/edit/:id', function (req, res) {

    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";

    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('description', 'Description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug = slug = title.replace(/\s+/g, '-').toLowerCase();
    var description = req.body.description;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;
    var id = req.params.id;

    var errors = req.validationErrors();

    if (errors) {
        req.session.errors = errors;
        res.redirect('/adminProducts/edit/' + id);
    } else {
        Product.findOne({ slug: slug, _id: { '$ne': id } }, function (error, product) {
            if (error)
                console.log(error);

            if (product) {
                req.flash('danger', 'Product title exists, choose another.');
                res.redirect('/adminProducts/edit/' + id);
            } else {
                Product.findById(id, function (error, product) {
                    if (error)
                        console.log(error);

                    product.title = title;
                    product.slug = slug;
                    product.description = description;
                    product.price = parseFloat(price).toFixed(2);
                    product.category = category;

                    if (imageFile != "")
                        product.image = imageFile;

                    product.save(function (error) {
                        if (error)
                            console.log(error);

                        if (imageFile != "") {
                            if (pimage != "") {
                                fs.remove('public/product_images/' + id + '/' + pimage, function (error) {
                                    if (error)
                                        console.log(error);
                                });
                            }

                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;

                            productImage.mv(path, function (error) {
                                return console.log(error);
                            });
                        }

                        req.flash('success', 'Product edited!!');
                        res.redirect('/adminProducts/edit/' + id);
                    });
                });
            }
        });
    }
});

//  POST product gallery
router.post('/product-gallery/:id', function (req, res) {

    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id + '/gallery/' + productImage.name;
    var thumbsPath = 'public/product_images/' + id + '/gallery/thumbs/' + productImage.name;

    productImage.mv(path, function (error) {
        if (error)
            console.log(error);

        resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(function (buffer) {
            fs.writeFileSync(thumbsPath, buffer);
        });
    });

    res.sendStatus(200);
});

//  DELETE delete image
router.get('/delete-image/:image', isAdmin, function (req, res) {

    var originalImage = 'public/product_images/' + req.query.id + '/gallery/' + req.params.image;
    var thumbImage = 'public/product_images/' + req.query.id + '/gallery/thumbs/' + req.params.image;

    fs.remove(originalImage, function (error) {
        if (error) {
            console.log(error);
        } else {
            fs.remove(thumbImage, function (error) {
                if (error) {
                    console.log(error);
                } else {
                    req.flash('success', 'Image deleted!!');
                    res.redirect('/adminProducts/edit/' + req.query.id);
                }
            });
        }
    });
});

//  DELETE delete product
router.get('/delete/:id', isAdmin, function (req, res) {

    var id = req.params.id;
    var path = 'public/product_images/' + id;

    fs.remove(path, function (error) {
        if (error) {
            console.log(error);
        } else {
            Product.findByIdAndRemove(id, function (error) {
                console.log(error);
            });

            req.flash('success', 'Product deleted!!');
            res.redirect('/adminProducts/products');
        }
    });
});

module.exports = router;
