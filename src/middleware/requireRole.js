function requireRole(...allowedRoles) {
  return function roleMiddleware(req, res, next) {
    if (!req.user) {
      return res.redirect("/auth/login");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).render("errors/403", {
        title: "Access denied"
      });
    }

    next();
  };
}

module.exports = requireRole;
