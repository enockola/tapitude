import User from "../models/User";
import { generateCsrfToken, doubleCsrfProtection, attachCsrfToken } from '../utils/securityUtils.js';

/**
 * load and attach the user to the request every time (get the user from session userId)
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
async function reqAttachments(req, res, next) {
  // We add the current path to the response locals
  res.locals.currentPath = req.path;

  //Load the CSRF token ONCE
  attachCsrfToken(req, res);

  // We try to attach the user to the request and response locals
  try {
    res.locals.currentUser = null;

    if (!req.session.userId) { //If there is no user in the session, ignore and go to the next middleware
      return next();
    }

    const user = await User.findById(req.session.userId)
      //Exclude sensitive fields
      .select("-passwordHash");

    if (user) {
      req.user = user;
      res.locals.currentUser = user;
    }
    return next();
  } catch (error) {
    return next(error);
  }
}

export default reqAttachments;
