const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const parser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const connectFlash = require('connect-flash');
const messages = require('express-messages');
const fileUpload = require('express-fileupload');
const config = require('./config/database');
const home = require('./routes/home')
const routes = require('./routes/pages');
const routesProduct = require('./routes/products');
const routesCart = require('./routes/cart');
const routesUser = require('./routes/users');
const routesAdminPages = require('./routes/admin_pages');
const routesAdminCategory = require('./routes/admin_categories');
const routesAdminProduct = require('./routes/admin_products');
const routesOrders = require('./routes/admin_orders');
const passport = require('passport');
const passportConfig = require('./config/passport');

mongoose.Promise = global.Promise;
//  connect to mongo.
mongoose.connect('mongodb://localhost:27017/lvl3');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', function () {
    console.log('connected to MongoDB');
});

//  init app
var app = express();

//  setup the engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//  set 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

//  set global errors
app.locals.errors = null;

//  get the page model
var Page = require('./models/page');

//  get all pages to pass to header.ejs
Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
    if (error)
        console.log(error);
    else
        app.locals.pages = pages;
});

//  get the category model
var Category = require('./models/category');

//  get all categories to pass to header.ejs
Category.find(function (error, categories) {
    if (error)
        console.log(error);
    else
        app.locals.categories = categories;
});

//  set file upload middleware
app.use(fileUpload());

//  set body parser middleware
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());

//  set express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true }
}));

//  set express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length)
            formParam += '[' + namespace.shift() + ']';

        return {
            param: formParam,
            msg: msg,
            value: value
        };
    },
    customValidators: {
        isImage: function (value, filename) {
            var extension = (path.extname(filename)).toLowerCase();

            switch (extension) {
                case '.jpg':
                    return '.jpg';
                case '.png':
                    return '.png'
                case '.jpeg':
                    return '.jpeg'
                case '':
                    return '.jpg'
                default:
                    return false;
            }
        }
    }
}));

//  set express messages middleware
app.use(connectFlash());
app.use(function (req, res, next) {
    res.locals.messages = messages(req, res);
    next();
});

//  Config passport
passportConfig(passport);

//  Set passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function (req, res, next) {
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
});

//  set routes
app.use("/home", home);
app.use('/', routes);
app.use('/products', routesProduct);
app.use('/cart', routesCart);
app.use('/user', routesUser);
app.use('/adminCategories', routesAdminCategory);
app.use('/adminProducts', routesAdminProduct);
app.use('/adminOrders', routesOrders)

//  start the app
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`The server is on the port ${port}`);
});
