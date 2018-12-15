var express = require('express');
var router = express.Router();
var auth = require('../config/auth');

var Page = require('../models/page');

var isAdmin = auth.isAdmin;

//  GET pages
router.get('/pages', isAdmin, function (req, res) {
    Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
        res.render('admin/pages', {
            title: 'All pages',
            pages: pages
        });
    });
});

//  Sort pages
function sortPages(ids, callback) {
    var count = 0;

    for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        count++;

        (function (count) {
            Page.findById(id, function (error, page) {
                page.sorting = count;

                page.save(function (error) {
                    if (error)
                        return console.log(error);

                    ++count;

                    if (count >= ids.length)
                        callback();
                });
            });
        })(count);
    }
}

//  POST reorder pages
router.post('/pages/reorder-pages', function (req, res) {
    var ids = req.body['id[]'];

    sortPages(ids, function () {
        Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
            if (error)
                console.log(error);
            else
                req.app.locals.pages = pages;
        });
    });
});

//  GET add page
router.get('/add', isAdmin, function (req, res) {
    var title = 'New page';
    var slug = '';
    var content = '';

    res.render('admin/add', {
        title: title,
        slug: slug,
        content: content
    });
});

//  POST add page
router.post('/add', function (req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;

    if (slug == '')
        slug = title.replace(/\s+/g, '-').toLowerCase();

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/add', {
            errors: errors,
            title: title,
            slug: slug,
            content: content
        });
    } else {
        Page.findOne({ slug: slug }, function (error, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');

                res.render('admin/add', {
                    title: title,
                    slug: slug,
                    content: content
                });
            } else {
                var newPage = new Page({
                    title: title,
                    slug: slug,
                    content: content,
                    sorting: 100
                });

                newPage.save(function (error) {
                    if (error)
                        return console.log(error);

                    Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
                        if (error)
                            console.log(error);
                        else
                            req.app.locals.pages = pages;
                    });

                    req.flash('success', 'Page added!!');
                    res.redirect('/adminPages/pages');
                });
            }
        });
    }
});

//  GET edit page
router.get('/edit/:id', isAdmin, function (req, res) {
    Page.findById(req.params.id, function (error, page) {
        if (error)
            return console.log(error);

        res.render('admin/edit', {
            title: page.title,
            slug: page.slug,
            content: page.content,
            id: page._id
        });
    });
});

//  POST edit page
router.post('/edit/:id', function (req, res) {
    req.checkBody('title', 'Title must have a value').notEmpty();
    req.checkBody('content', 'Content must have a value').notEmpty();

    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, '-').toLowerCase();
    var content = req.body.content;
    var id = req.body.id;

    if (slug == '')
        slug = title.replace(/\s+/g, '-').toLowerCase()

    var errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit', {
            errors: errors,
            title: title,
            slug: slug,
            content: content,
            id: id
        });
    } else {
        Page.findOne({ slug: slug, _id: { '$ne': id } }, function (error, page) {
            if (page) {
                req.flash('danger', 'Page slug exists, choose another.');

                res.render('admin/edit', {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id
                });
            } else {
                Page.findById(id, function (error, page) {
                    if (error)
                        return console.log(error);

                    page.title = title;
                    page.slug = slug;
                    page.content = content;

                    page.save(function (error) {
                        if (error)
                            return console.log(error);

                        Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
                            if (error)
                                console.log(error);
                            else
                                req.app.locals.pages = pages;
                        });

                        req.flash('success', 'Page edited!!');
                        res.redirect('/adminPages/edit/' + page._id);
                    });
                });
            }
        });
    }
});

//  DELETE delete page
router.get('/delete/:id', isAdmin, function (req, res) {
    Page.findByIdAndRemove(req.params.id, function (error) {
        if (error)
            return console.log(error);

        Page.find({}).sort({ sorting: 1 }).exec(function (error, pages) {
            if (error)
                console.log(error);
            else
                req.app.locals.pages = pages;
        });

        req.flash('success', 'Page deleted!!');
        res.redirect('/adminPages/pages');
    });
});

module.exports = router;
