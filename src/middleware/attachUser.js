import User from "../models/User";

async function attachUser(req, res, next) {
  try {
    res.locals.currentUser = null;

    if (!req.session.userId) {
      return next();
    }

    const user = await User.findById(req.session.userId).select("-passwordHash");

    if (!user || user.status !== "active") {
      req.session.destroy(() => {});
      return next();
    }

    req.user = user;
    res.locals.currentUser = user;
    next();
  } catch (error) {
    next(error);
  }
}

module.exports = attachUser;
