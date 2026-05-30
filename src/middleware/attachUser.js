import User from "../models/User";

/**
 * Express middleware that authenticates the user session and populates global user data.
 * * This middleware checks the current session for a `userId`. If found, it fetches the 
 * corresponding user document from the database (excluding sensitive fields like the password hash)
 * and attaches it to the request and response contexts. If the user account is found to be
 * inactive or deleted, the session is forcefully destroyed.
 * * @async
 * @function attachUser
 * @param {import('express').Request} req - The Express request object.
 * @param {Object} req.session - The user session object provided by session middleware.
 * @param {string} [req.session.userId] - The unique identifier of the logged-in user.
 * @param {Object} [req.user] - The populated Mongoose User document (attached if authenticated).
 * @param {import('express').Response} res - The Express response object.
 * @param {Object} res.locals - Local variables scoped to the request, passed directly to rendering engines (e.g., EJS).
 * @param {Object|null} res.locals.currentUser - The authenticated user data, or `null` if the visitor is a guest.
 * @param {import('express').NextFunction} next - The next Express middleware function callback in the pipeline.
 * @returns {Promise<void>} Passes control to the next middleware or error handler.
 */
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
