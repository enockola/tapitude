function requireAuth(req, res, next) {
  if (!req.user) {//If no user is logged in, redirect to the login page
    return res.redirect("/auth/login");
  }

  next();
}

module.exports = requireAuth;
