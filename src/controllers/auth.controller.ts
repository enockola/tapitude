import User from "../models/User";
import asyncHandler from "../utils/asyncHandler";
import { Request, Response, Router } from 'express';

export class AuthController {
  registerRoutes(router: Router) {
    router.get("/login", this.showLogin);
    router.post("/login", asyncHandler(this.login));
    router.get("/logout", this.logout);
    router.post("/logout", this.logout);
  }

  showLogin = async (req: Request, res: Response): Promise<void> => {
    res.render("forms/login", {
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

    if (!user || user.status !== "active") {
      return res.status(401).render("forms/login", {
        title: "Log in",
        error: "User account not found."
      });
    }

    const passwordMatches = await user.comparePassword(password);
    if (!passwordMatches) {
      return res.status(401).render("forms/login", {
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
    req.session.destroy(() => {
      res.clearCookie("tapitude.sid");
      res.redirect("/");
    });
  }
}

export default new AuthController();