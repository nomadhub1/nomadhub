function flash(req, key, message) {
  if (!req.session.flash) req.session.flash = {};
  req.session.flash[key] = message;
}

function consumeFlash(req, key) {
  const message = req.session.flash?.[key];
  if (req.session.flash) delete req.session.flash[key];
  return message;
}

module.exports = { flash, consumeFlash };
