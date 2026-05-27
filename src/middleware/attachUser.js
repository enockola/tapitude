const User = require("../models/User");
const { findMockUserById } = require("../data/mockData");

async function attachUser(req, res, next) {
  try {
    res.locals.currentUser = null;

    if (!req.session.userId) {
      return next();
    }

    if (process.env.USE_MOCK_DATA === "true") {
      const mockUser = findMockUserById(req.session.userId);

      if (!mockUser || mockUser.status !== "active") {
        req.session.destroy(() => {});
        return next();
      }

      req.user = mockUser;
      res.locals.currentUser = mockUser;
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
