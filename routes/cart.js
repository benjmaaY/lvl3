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
router.get('/add/:product', function (req, res) {

    var slug = req.params.product;

    Product.findOne({ slug: slug }, function (error, product) {
        if (error)
            console.log(error);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            req.session.cart.push({
                title: slug,
                qty: 1,
                price: parseFloat(product.price).toFixed(2),
                image: '/product_images/' + product._id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < cart; i++) {
                if (cart[i].title == slug) {
                    cart[i].qty++;
                    newItem = false;

                    break;
                }
            }

            if (newItem) {
                cart.push({
                    title: slug,
                    qty: 1,
                    price: parseFloat(product.price).toFixed(2),
                    image: '/product_images/' + product._id + '/' + product.image
                });
            }
        }

        req.flash('success', 'Product added!!!');
        res.redirect('back');
    });
});

//  GET checkout page
router.get('/checkout', function (req, res) {

    if (req.session.cart && req.session.cart.length == 0) {
        delete req.session.cart;
        res.redirect('/cart/checkout');
    } else {
        res.render('checkout', {
            title: 'Checkout',
            cart: req.session.cart,
            city: city
        });
    }
});

router.get('/successful/:id', isUser,  function (req, res) {
    const id = req.params.id
    Order.findOne({ order_id: id }, (error, order) => {
        if (error)
            console.log(error)
        res.render('confirmed', {
            title: 'title',
            order: order
        })
    })
});

//  GET update product
router.get('/update/:product', function (req, res) {

    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for (var i = 0; i < cart.length; i++) {
        if (cart[i].title == slug) {
            switch (action) {
                case "add":
                    cart[i].qty++;

                    break;
                case "remove":
                    cart[i].qty--;

                    if (cart[i].qty < 1) cart.splice(i, 1);

                    break;
                case "clear":
                    cart.splice(i, 1);
                    if (cart.length == 0) delete req.session.cart;

                    break;
                default:
                    console.log('update problem');

                    break;
            }

            break;
        }
    }

    req.flash('success', 'Cart updated!!');
    res.redirect('/cart/checkout');
});

//  GET clear cart
router.get('/clear', function (req, res) {
    delete req.session.cart;

    req.flash('success', 'Cart cleared!!');
    res.redirect('/cart/checkout');
});
const city = [
    {
        "city": "Tunis",
        "admin": "Tunis",
        "country": "Tunisia",
        "population_proper": "728453",
        "iso2": "TN",
        "capital": "primary",
        "lat": "36.806112",
        "lng": "10.171078",
        "population": "2412500"
    },
    {
        "city": "Sfax",
        "admin": "Sfax",
        "country": "Tunisia",
        "population_proper": "277278",
        "iso2": "TN",
        "capital": "admin",
        "lat": "34.740556",
        "lng": "10.760278",
        "population": "453050"
    },
    {
        "city": "Hammam Sousse",
        "admin": "Sousse",
        "country": "Tunisia",
        "population_proper": "164123",
        "iso2": "TN",
        "capital": "",
        "lat": "35.860904",
        "lng": "10.603131",
        "population": "327004"
    },
    {
        "city": "Gab\u00e8s",
        "admin": "Gab\u00e8s",
        "country": "Tunisia",
        "population_proper": "110075",
        "iso2": "TN",
        "capital": "admin",
        "lat": "33.881457",
        "lng": "10.098196",
        "population": "219517"
    },
    {
        "city": "Zarzis",
        "admin": "M\u00e9denine",
        "country": "Tunisia",
        "population_proper": "79316",
        "iso2": "TN",
        "capital": "",
        "lat": "33.503981",
        "lng": "11.112155",
        "population": "159161"
    },
    {
        "city": "Kairouan",
        "admin": "Kairouan",
        "country": "Tunisia",
        "population_proper": "119794",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.678102",
        "lng": "10.096333",
        "population": "144522"
    },
    {
        "city": "Bizerte",
        "admin": "Bizerte",
        "country": "Tunisia",
        "population_proper": "115268",
        "iso2": "TN",
        "capital": "admin",
        "lat": "37.274423",
        "lng": "9.87391",
        "population": "139843"
    },
    {
        "city": "Gafsa",
        "admin": "Gafsa",
        "country": "Tunisia",
        "population_proper": "81232",
        "iso2": "TN",
        "capital": "admin",
        "lat": "34.425",
        "lng": "8.784167",
        "population": "126803"
    },
    {
        "city": "Nabeul",
        "admin": "Nabeul",
        "country": "Tunisia",
        "population_proper": "115149",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.456058",
        "lng": "10.73763",
        "population": "115149"
    },
    {
        "city": "Ariana",
        "admin": "Tunis",
        "country": "Tunisia",
        "population_proper": "97687",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.860117",
        "lng": "10.193371",
        "population": "97687"
    },
    {
        "city": "Kasserine",
        "admin": "Kasserine",
        "country": "Tunisia",
        "population_proper": "78158",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.167578",
        "lng": "8.836506",
        "population": "81987"
    },
    {
        "city": "Mnara",
        "admin": "Monastir",
        "country": "Tunisia",
        "population_proper": "41400",
        "iso2": "TN",
        "capital": "",
        "lat": "35.697731",
        "lng": "10.781591",
        "population": "71546"
    },
    {
        "city": "Tataouine",
        "admin": "Tataouine",
        "country": "Tunisia",
        "population_proper": "62577",
        "iso2": "TN",
        "capital": "admin",
        "lat": "32.929674",
        "lng": "10.451767",
        "population": "62577"
    },
    {
        "city": "B\u00e9ja",
        "admin": "B\u00e9ja",
        "country": "Tunisia",
        "population_proper": "57233",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.725638",
        "lng": "9.181692",
        "population": "59567"
    },
    {
        "city": "Jendouba",
        "admin": "Jendouba",
        "country": "Tunisia",
        "population_proper": "51408",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.501136",
        "lng": "8.780239",
        "population": "51408"
    },
    {
        "city": "El Kef",
        "admin": "Kef",
        "country": "Tunisia",
        "population_proper": "36628",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.174239",
        "lng": "8.704863",
        "population": "47979"
    },
    {
        "city": "Mahdia",
        "admin": "Mahdia",
        "country": "Tunisia",
        "population_proper": "45977",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.504722",
        "lng": "11.062222",
        "population": "45977"
    },
    {
        "city": "Sidi Bouzid",
        "admin": "Sidi Bouzid",
        "country": "Tunisia",
        "population_proper": "42098",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.038234",
        "lng": "9.484935",
        "population": "42098"
    },
    {
        "city": "Tozeur",
        "admin": "Tozeur",
        "country": "Tunisia",
        "population_proper": "34943",
        "iso2": "TN",
        "capital": "admin",
        "lat": "33.919683",
        "lng": "8.13352",
        "population": "39504"
    },
    {
        "city": "Siliana",
        "admin": "Siliana",
        "country": "Tunisia",
        "population_proper": "26960",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.084966",
        "lng": "9.370818",
        "population": "26960"
    },
    {
        "city": "Kebili",
        "admin": "K\u00e9bili",
        "country": "Tunisia",
        "population_proper": "19875",
        "iso2": "TN",
        "capital": "admin",
        "lat": "33.704387",
        "lng": "8.969034",
        "population": "19875"
    },
    {
        "city": "Ben Gardane",
        "admin": "M\u00e9denine",
        "country": "Tunisia",
        "population_proper": "13364",
        "iso2": "TN",
        "capital": "",
        "lat": "33.13783",
        "lng": "11.219649",
        "population": "19843"
    },
    {
        "city": "Zaghouan",
        "admin": "Zaghouan",
        "country": "Tunisia",
        "population_proper": "16911",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.402907",
        "lng": "10.142925",
        "population": "16911"
    },
    {
        "city": "Dehiba",
        "admin": "Tataouine",
        "country": "Tunisia",
        "population_proper": "3525",
        "iso2": "TN",
        "capital": "",
        "lat": "32.007992",
        "lng": "10.701353",
        "population": "3525"
    },
    {
        "city": "Sousse",
        "admin": "Sousse",
        "country": "Tunisia",
        "population_proper": "",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.825388",
        "lng": "10.636991",
        "population": ""
    },
    {
        "city": "Ben Arous",
        "admin": "Tunis",
        "country": "Tunisia",
        "population_proper": "",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.753056",
        "lng": "10.218889",
        "population": ""
    },
    {
        "city": "Medenine",
        "admin": "M\u00e9denine",
        "country": "Tunisia",
        "population_proper": "",
        "iso2": "TN",
        "capital": "admin",
        "lat": "33.354947",
        "lng": "10.505478",
        "population": ""
    },
    {
        "city": "Manouba",
        "admin": "Tunis",
        "country": "Tunisia",
        "population_proper": "",
        "iso2": "TN",
        "capital": "admin",
        "lat": "36.808029",
        "lng": "10.097205",
        "population": ""
    },
    {
        "city": "Monastir",
        "admin": "Monastir",
        "country": "Tunisia",
        "population_proper": "",
        "iso2": "TN",
        "capital": "admin",
        "lat": "35.783333",
        "lng": "10.833333",
        "population": ""
    }
]
//  GET buy now
module.exports = router;
