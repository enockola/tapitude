import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response, Router } from 'express';
import { adminCheck, creatorCheck } from '../middleware/security.js';
import { logger } from '../utils/loggingUtils.js';
import { ObjectId } from "mongodb";
import session from 'express-session';
import flash from 'connect-flash';

export class AuthController {
  registerRoutes(router: Router) {
    router.get("/login", this.showLogin);


    router.post("/login", asyncHandler(this.login));
    router.post("/logout", asyncHandler(this.logout));

    router.post("/change-password-creator/:id", creatorCheck, asyncHandler(this.changePasswordCreator));
    router.post("/change-password-admin", adminCheck, asyncHandler(this.changePasswordAdmin));
  }

  change_password = async (
    req: Request,
    res: Response,
    password1: string,
    password2: string,
    userId: string | null,
    fallbackRedirect: string
  ): Promise<void> => {

    // Helper helper to safely redirect back, but default to the fallback if referer is missing or "/"
    const safeRedirect = () => {
      const referer = req.get("referer");
      if (referer && referer !== "/") {
        return res.redirect("back");
      }
      return res.redirect(fallbackRedirect);
    };

    // 1. Validation: Passwords match
    if (password1 !== password2) {
      req.flash("error", "Passwords do not match.");
      return safeRedirect();
    }

    // 2. Validation: Length check
    if (password1.length < 8) {
      req.flash("error", "Password must be at least 8 characters long.");
      return safeRedirect();
    }

    // 3. Validation: Complexity check (Uppercase, Lowercase, Number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;
    if (!passwordRegex.test(password1)) {
      req.flash(
        "error",
        "Password must be at least 8 characters long and contain uppercase, lowercase, and a number."
      );
      return safeRedirect();
    }

    // 4. Fetch User
    const user = userId ? await User.findById(userId) : null;
    if (!user) {
      req.flash("error", "User not found.");
      return safeRedirect();
    }

    console.log(`Attempting password change for user ID: ${user._id}`);

    // 5. Attempt password update
    if (await user.changePassword(password1)) {
      req.flash("success", "Password changed successfully.");
      return safeRedirect();
    }

    // 6. Fallback internal failure
    req.flash("error", "Could not update password. Make sure it meets requirements.");
    return safeRedirect();
  }

  changePasswordCreator = async (req: Request, res: Response): Promise<void> => {
    const { password1, password2, redirectTo } = req.body;

    const value: string | string[] = req.params.id; // Example value
    const userId: string = Array.isArray(value) ? value[0] : value;
    return this.change_password(req, res, password1, password2, userId, redirectTo);
  }


  changePasswordAdmin = async (req: Request, res: Response): Promise<void> => {
    const { password1, password2 } = req.body;

    let userId = req.user ? req.user._id.toString() : "";
    return this.change_password(req, res, password1, password2, userId, "/admin/settings");
  }

  showLogin = async (req: Request, res: Response): Promise<void> => {
    if (req.user) { //If the user is logged in, redirect to the dashboard
      if (req.user.role === "admin") {
        return res.redirect("/admin/dashboard");
      }
      return res.redirect("/creator/dashboard");
    }


    res.render("login", {
      title: "Log in",
      error: null
    });
  }

  login = async (req: Request, res: Response): Promise<void> => {
    //First we get the request
    const { email, password } = req.body;

    //We get the user from the User model
    const user = await User.findOne({ email: email?.toLowerCase().trim() });
    // console.log("The user is: ", user);

    if (!user) {
      return res.status(401).render("login", {
        title: "Log in",
        error: "User account not found."
      });
    } else if (user.status !== "active") {
      return res.status(403).render("login", {
        title: "Log in",
        error: "User account has been disabled."
      });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).render("login", {
        title: "Log in",
        error: "Invalid email or password."
      });
    }

    req.session.userId = user._id.toString();


    //We automatically redirect the user based on their role
    if (user.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/creator/dashboard");
  }

  logout = async (req: Request, res: Response): Promise<void> => {
    try {
      await new Promise<void>((resolve, reject) => {// 1. Destroy the session in the database
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.clearCookie("tapitude.sid");// 2. Clear the cookie from the browser

      res.redirect("/"); // 3. Redirect
    } catch (err) {
      console.error("Logout error:", err);
      res.status(500).render("Could not log out, please try again.");
    }
  }
}

export default new AuthController();