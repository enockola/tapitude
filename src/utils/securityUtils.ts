import { doubleCsrf } from "csrf-csrf";
import crypto from 'crypto';
import User from '../models/User';
import { Request, Response, NextFunction } from 'express';
import "dotenv/config";

if (!process.env.CSRF_SECRET)
    throw new Error("CSRF_SECRET is not set");

const COOKIE_CSRF_NAME = "psifi-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

const {
    invalidCsrfTokenError, // This is just for convenience if you plan on making your own middleware.
    generateCsrfToken, // Use this in your routes to provide a CSRF token.
    validateRequest, // Also a convenience if you plan on making your own middleware.
    doubleCsrfProtection, // This is the default CSRF protection middleware.
} = doubleCsrf({
    getSecret: (req) => process.env.CSRF_SECRET || "dev_secret_change_me",
    getSessionIdentifier: (req) => req.sessionID, // return the requests unique identifier
    cookieName: COOKIE_CSRF_NAME,
    getCsrfTokenFromRequest: (req) =>
        (req.headers[CSRF_HEADER_NAME] as string) ||
        (req.body?._csrf as string)
});

export const attachCsrfToken = (req: Request, res: Response) => {
    // const cookieToken = req.cookies[COOKIE_CSRF_NAME];
    if (!res.locals._csrf)
        req.session.csrfToken = generateCsrfToken(req, res);
        res.locals._csrf = req.session.csrfToken;
}

export const checkDoubleCsrf = (req: Request, res: Response, next: NextFunction) => {
    const cookieToken = req.cookies[COOKIE_CSRF_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;
    const bodyToken = req.body?._csrf as string;

    if (process.env.NODE_ENV === "development") {
        console.log("=== CSRF DEBUG START ===");
        console.log("COOKIE CSRF:", cookieToken);
        console.log("HEADER CSRF:", headerToken);
        console.log("BODY CSRF:", bodyToken);
        console.log("\nSESSION ID:", req.sessionID);
        console.log("COOKIE SESSION ID:", req.cookies["tapitude.sid"]);
        console.log("=== CSRF DEBUG END ===");
    }

    const providedToken = headerToken || bodyToken;
    if (!cookieToken || !providedToken) {
        console.log("❌ NO CSRF TOKEN DETECTED!");
        return res.status(403).render("errors/403", { title: "Forbidden" });
    }

    const cookieBuffer = Buffer.from(cookieToken, "utf-8");
    const providedBuffer = Buffer.from(providedToken, "utf-8");

    const secureMatch = crypto.timingSafeEqual(cookieBuffer, providedBuffer);

    if (!secureMatch) {
        console.log("❌ CSRF TOKEN MISMATCH DETECTED!");
        return res.status(403).render("errors/403", { title: "Forbidden" });
    }
    return next();

    // return doubleCsrfProtection(req, res, next);
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
    validateRequest
}