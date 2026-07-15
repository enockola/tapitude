import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response, Router } from 'express';
import { adminCheck, creatorCheck } from '../middleware/security.js';
import { logger } from '../utils/loggingUtils.js';

export class AuthController {
  registerRoutes(router: Router) {
    router.get("/login", this.showLogin);


    router.post("/login", asyncHandler(this.login));
    router.post("/logout", asyncHandler(this.logout));

    router.post("/change-password-creator/:id", creatorCheck, asyncHandler(this.changePasswordCreator));
    router.post("/change-password-admin", adminCheck, asyncHandler(this.changePasswordAdmin));
  }

  change_password = async (req: Request, res: Response, redirect: string, title: string, password1: string, password2: string, userId: any): Promise<void> => {
    logger.info("Changing password for user:", userId, "with password:", password1, "and password:", password2, "and title:", title, "and redirect:", redirect);
    if (password1 !== password2) {
      return res.status(400).render(redirect, {
        title: title,
        error: "Passwords do not match."
      });
    }
    if (password1.length < 8) {
      return res.status(400).render(redirect, {
        title: title,
        error: "Password must be at least 8 characters long."
      });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/;

    if (!passwordRegex.test(password1)) {
      return res.status(400).render(redirect, {
        title: title,
        error: "Password must be at least 8 characters long and contain uppercase, lowercase, and a number."
      });
    }

    const user = req.user && await User.findById(userId);
    if (!user) {
      return res.status(404).render(redirect, {
        title: title,
        error: "User not found."
      });
    }
    console.log(user);

    if (await user.changePassword(password1)) {
      // Ensure you use your template name here (e.g., redirect)
      // NOT the URL path "/admin/settings"
      return res.render(redirect, {
        title: title,
        success: "Password changed successfully."
      });
    }

    return res.status(400).render(redirect, {
      title: title,
      error: "Could not update password. Make sure it meets requirements."
    });
  }


  changePasswordCreator = async (req: Request, res: Response): Promise<void> => {
    const { password1, password2 } = req.body;
    const userId = req.params.id;
    return this.change_password(req, res, "/creator/settings", "Creator Settings", password1, password2, userId);
  }


  changePasswordAdmin = async (req: Request, res: Response): Promise<void> => {
    const { password1, password2 } = req.body;
    const userId = req.user ? req.user._id : null;
    return this.change_password(req, res, "/admin/admin-settings", "Admin Settings", password1, password2, userId);
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