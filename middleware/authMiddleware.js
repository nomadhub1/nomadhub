function ensureAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.redirect('/admin/login');
}

function attachUser(req, res, next) {
  if (req.session && req.session.user) {
    res.locals.user = req.session.user;
  } else {
    res.locals.user = null;
  }
  next();
}

module.exports = {
  ensureAuthenticated,
  attachUser,
  ensureAdmin: function(req, res, next) {
    if (req.session && req.session.user && req.session.user.isAdmin) {
      return next();
    }
    return res.redirect(302, '/admin/login');
  }
};
