exports.isUser = function (req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        req.flash('danger', 'Please log in.');
        res.redirect('/user/login');
    }
}

exports.isAdmin = function (req, res, next) {
    if (req.isAuthenticated() && res.locals.user.admin == 1) {
        next();
    } else {
        req.flash('danger', 'Please log in as an admin.');
        res.redirect('/user/login');
    }
}
