import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import "dotenv/config";

if (!process.env.CSRF_SECRET)
    throw new Error("CSRF_SECRET is not set");

const COOKIE_CSRF_NAME = "psifi-csrf-token";
//It should start with __Host- on a production environment
const CSRF_HEADER_NAME = "x-csrf-token";

export const attachCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    if (!["GET"].includes(req.method)) {
        return next();
    }

    if (!req.session.csrfToken) { // Only generate the CSRF token ONCE per session lifetime
        const secret = process.env.CSRF_SECRET;
        const sessionIdentifier = req.sessionID;
        if (!secret) {
            throw new Error("CSRF_SECRET environment variable is missing");
        }

        // Generate a stable, session-bound base secret using HMAC
        req.session.csrfToken = crypto.createHmac("sha256", secret).update(sessionIdentifier).digest("hex");
    }

    //Always keep the cookie synchronized with the session token
    res.cookie(COOKIE_CSRF_NAME, req.session.csrfToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
    });

    //Pass this stable token to your HTML form views
    res.locals._csrf = req.session.csrfToken;

    next();
}

export const checkDoubleCsrf = (req: Request, res: Response, next: NextFunction) => {
    // Skip protection for read-only GET requests
    if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
        return next();
    }

    const cookieToken = req.cookies[COOKIE_CSRF_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME] as string;
    const bodyToken = req.body?._csrf as string;
    const isDevelopment = process.env.NODE_ENV === "development";
    if (isDevelopment) {
        console.log("=== CSRF DEBUG START ===");
        console.log("COOKIE CSRF:", cookieToken);
        console.log("HEADER CSRF:", headerToken);
        console.log("BODY CSRF:", bodyToken);
        console.log("\nSESSION ID:", req.sessionID);
        console.log("=== CSRF DEBUG END ===");
    }
    const providedToken = headerToken || bodyToken;

    // 1. Fail early if either token is missing entirely
    if (!cookieToken || !providedToken) {
        if (isDevelopment) console.log("❌ NO CSRF TOKEN!");
        return show403(res, "Forbidden: Invalid CSRF Token");
    }

    const cookieBuffer = Buffer.from(cookieToken, "utf-8");
    const providedBuffer = Buffer.from(providedToken, "utf-8");

    // 2. CRITICAL: timingSafeEqual throws an error if buffer lengths don't match!
    if (cookieBuffer.length !== providedBuffer.length) {
        if (isDevelopment) console.log("❌ CSRF LENGTH MISMATCH!");
        return show403(res, "Forbidden: Invalid CSRF Token");
    }

    // 3. Time-safe comparison of the two matching-length buffers
    if (!crypto.timingSafeEqual(cookieBuffer, providedBuffer)) {
        if (isDevelopment) console.log("❌ CSRF TOKEN MISMATCH!");
        return show403(res, "Forbidden: Invalid CSRF Token");
    }
    return next();
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
