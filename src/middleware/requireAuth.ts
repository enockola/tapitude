export function requireAuth(req, res, next) {
  if (!req.user) {//If no user is logged in, redirect to the login page
    return res.redirect("/auth/login");
  }

  next();
}

export function requireRole(...allowedRoles) {
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
