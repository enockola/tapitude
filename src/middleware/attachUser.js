import User from "../models/User";


async function attachUser(req, res, next) {
  // We add the current path to the response locals
  res.locals.currentPath = req.path;

  // We try to attach the user to the request and response locals
  try {
    res.locals.currentUser = null;

    if (!req.session.userId) {
      return next();
    }

    const user = await User.findById(req.session.userId).select("-passwordHash");
    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = attachUser;
