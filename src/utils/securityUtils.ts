import { doubleCsrf } from "csrf-csrf";
import crypto from 'crypto';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';
import "dotenv/config";

if (!process.env.CSRF_SECRET)
    throw new Error("CSRF_SECRET is not set");

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateCsrfToken, // Use this in your routes to provide a CSRF token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: (req) => process.env.CSRF_SECRET || "dev_secret_change_me",
    getSessionIdentifier: (req) => req.sessionID, // return the requests unique identifier
    getCsrfTokenFromRequest: (req) =>
        (req.headers["x-csrf-token"] as string) ||
        (req.body?._csrf as string)
});

export const csrfDebugMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log("sessionID:", req.sessionID);
    console.log("COOKIE CSRF:", req.cookies["__Host-psifi.x-csrf-token"]);
    console.log("HEADER CSRF:", req.headers["x-csrf-token"]);
    console.log("BODY CSRF:", req.body._csrf);
    console.log("cookie session:", req.cookies["tapitude.sid"]);
    next();
}

// Server level middlewares
export const injectCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    const token = generateCsrfToken(req, res);
    if (token) res.locals._csrf = token;
    next();
};

// Utility functions
function show403(res: Response, title: string) {
    return res.status(403).render("errors/403", {
        title: title
    });
}

// Controller middlewares
export const adminCheck = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return show403(res, "Forbidden: Unauthorized admin");
}

export const creatorCheck = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'creator')) {
        if (req.user.status !== 'active') return show403(res, "Forbidden: Creator account is disabled");
        return next();
    }
    return show403(res, "Forbidden: Unauthorized creator");
}

export {
    invalidCsrfTokenError,
    generateCsrfToken,
    validateRequest,
    doubleCsrfProtection
}