import { doubleCsrf } from "csrf-csrf";
import crypto from 'crypto';

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateCsrfToken, // Use this in your routes to provide a CSRF token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: (req) => 'return some cryptographically pseudorandom secret here',
    getSessionIdentifier: (req) => req.session.id, // return the requests unique identifier
    //   getCsrfTokenFromRequest: (req) => req.body._csrf,   //Force it to use the _csrf field
});

import { Request, Response, NextFunction } from 'express';


/**
 * Requres the csrf token to be in the header or the body of the request
 * In the header, the field should be "x-csrf-token"
 * In the body, the field should be "_csrf"
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 */
export const manualCsrfCheck = (req: Request, res: Response, next: NextFunction, verbose = false) => {
    //Get cookie token and body token

    //A malicious site (attacker.com) cannot read or write cookies belonging to your domain
    const cookieToken = req.cookies['__Host-psifi.x-csrf-token'];
    if (!cookieToken) {
        return res.status(500).render('Forbidden: Missing CSRF Cookie Token');
    }
    if (verbose) console.log("       The cookie token is: ", cookieToken);

    //The attacker can trigger the request, and your browser will attach the cookie, but the attacker cannot read the data on your site.
    let headerToken = req.headers['x-csrf-token'] as string; //get the header token from the 
    if (!headerToken) {
        headerToken = req.body._csrf; //If we can't get the header token from the header, we can get it from the body
        if (verbose) console.log("       The body token is: ", headerToken);
        if (!headerToken) {
            return res.status(500).render('Forbidden: Missing CSRF Header/Body Token');
        }
    } else if (verbose) console.log("       The header token is: ", headerToken);

    //If the value in the cookie and the value in the body are identical, 
    // the server concludes that the request originated from your own website 
    // because only your website's code has the ability to read the cookie 
    // and inject its value into the form.
    const isMatch = crypto.timingSafeEqual( //Checks if the two buffers are equal at a constant time to prevent timing attacks
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
    );
    if (verbose) console.log("       CSRF tokens match: ", isMatch);

    if (!isMatch) {
        return res.status(500).render('Forbidden: Invalid CSRF Token');
    }

    next();
};

export {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection
}