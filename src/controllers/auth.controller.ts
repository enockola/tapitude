import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response, Router } from 'express';
import { generateCsrfToken, checkDoubleCsrf } from '../utils/securityUtils.js';

export class AuthController {
  registerRoutes(router: Router) {
    router.get("/login", this.showLogin);

    router.post("/login", asyncHandler(this.login));
    router.post("/logout", checkDoubleCsrf, asyncHandler(this.logout));
  }

  showLogin = async (req: Request, res: Response): Promise<void> => {
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