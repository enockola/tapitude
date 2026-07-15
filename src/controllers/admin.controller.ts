import User, { getPasswordValidationError } from "../models/User";
import CreatorProfile from "../models/CreatorProfile";
import ContentPage from "../models/ContentPage";
import mongoose from "mongoose";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";
import { adminCheck } from '../middleware/security.js';
import session from 'express-session';
import flash from 'connect-flash';

export class AdminController {

  registerRoutes(router: Router) {
    router.get("/dashboard", adminCheck, asyncHandler(this.getDashboardView));
    router.get("/creators", adminCheck, asyncHandler(this.getCreatorsView));
    router.get("/creators/new", adminCheck, asyncHandler(this.getNewCreatorView));
    router.get("/edit-creator-account/:id", adminCheck, asyncHandler(this.getEditCreator));
    router.get("/settings", adminCheck, asyncHandler(this.getAdminSettingsView));

    router.post("/creators/new", adminCheck, asyncHandler(this.postNewCreator));
    router.post("/edit-creator-account/:id", adminCheck, asyncHandler(this.postEditCreator));
    router.post("/delete-creator-account/:id", adminCheck, asyncHandler(this.postDeleteCreator));

  }


  getDashboardView = async (req: Request, res: Response): Promise<void> => {
    const creatorCount = await User.countDocuments({ role: "creator" });
    const adminCount = await User.countDocuments({ role: "admin" });
    const contentCount = await ContentPage.countDocuments();

    let adminsList = await User.find({ role: "admin" })
      .select("name email -_id") // Space-separated fields. The '-' prefix excludes a field.
      .lean()

    const myself = req.user;
    if (!myself) {
      return res.redirect("/login");
    }
    const myAccount = adminsList.find(admin => admin.email.toLowerCase() === myself.email.toLowerCase()) || null;
    adminsList = adminsList.filter(admin => admin.email.toLowerCase() !== myself.email.toLowerCase());

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      creatorCount,
      adminCount,
      contentCount,
      adminsList,
      myAccount
    });
  }

  getAdminSettingsView = async (req: Request, res: Response): Promise<void> => {
    res.render("admin/admin-settings", {
      title: "Admin Settings",
      success: req.flash("success")[0] || null,
      error: req.flash("error")[0] || null
    });
  }

  getCreatorsView = async (req: Request, res: Response): Promise<void> => {
    const creators = await User.find({ role: "creator" }).sort({ createdAt: -1 });

    res.render("admin/creators", {
      title: "Creators",
      creators,
      success: req.flash("success")[0] || null,
      error: req.flash("error")[0] || null
    });
  }


  getEditCreator = async (req: Request, res: Response): Promise<void> => {
    try {
      ///edit-creator-account/:id
      //We get the ID parameter, the routes makes it easy for us to get the ID
      const creator = await User.findById(req.params.id);
      // console.log("The creator is: ", creator);
      const creatorProfile = await CreatorProfile.findOne({ userId: req.params.id });
      // console.log("The creator profile is: ", creatorProfile);

      if (!creator || !creatorProfile) {
        return res.status(404).render("errors/404", {
          title: "Creator profile not found"
        });
      }

      res.render("admin/edit-creator-account", {
        title: "Edit Creator Account",
        creator,
        creatorProfile,
        success: req.flash("success")[0] || null,
        error: req.flash("error")[0] || null
      });
    } catch (error) {
      res.status(500).render("Error loading creator profile");
      console.error(error);
    }
  }

  getNewCreatorView = async (req: Request, res: Response): Promise<void> => {
    res.render("admin/new-creator-account", {
      title: "Create Creator Account",
      success: req.flash("success")[0] || null,
      error: req.flash("error")[0] || null
    });
  }

  postNewCreator = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password1, password2, brandName } = req.body;

    // Local helper to dry up error rendering and preserve form data
    const renderError = (status: number, message: string) => {
      return res.status(status).render("admin/new-creator-account", {
        title: "Create Creator Account",
        error: message,
        name,
        email,
        brandName
      });
    };

    // 1. Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return renderError(400, "An account with this email already exists.");
    }

    // 2. Check if passwords match
    if (password1 !== password2) {
      return renderError(400, "Passwords do not match.");
    }

    // 3. Verify password complexity requirements
    const passwordError = getPasswordValidationError(password1);
    if (passwordError) {
      return renderError(400, passwordError);
    }

    // 4. Create the Account and Profile
    try {
      const user = await User.createAccount({
        name,
        email,
        password: password1,
        role: "creator"
      });

      if (!user) {
        throw new Error("User creation returned null.");
      }

      await CreatorProfile.create({
        userId: user._id,
        displayName: name,
        brandName
      });

      return res.redirect("/admin/creators");

    } catch (err) {
      console.error("Account creation failure: ", err);
      return renderError(500, "Error creating creator account.");
    }
  }

  postEditCreator = async (req: Request, res: Response): Promise<void> => {
    const { name, email, status } = req.body;
    const creator = await User.findById(req.params.id);

    creator.name = name;
    creator.email = email;
    creator.status = status;
    await creator.save();
    this.getEditCreatorsView(req, res);
    // res.redirect(req.originalUrl);
  }

  postDeleteCreator = async (req: Request, res: Response): Promise<void> => {
    const { email, password, redirectTo } = req.body;

    // Use the form's redirectTo value, falling back to /admin/creators if missing
    const fallbackRedirect = redirectTo || "/admin/creators";

    const safeRedirect = () => {
      const referer = req.get("referer");
      if (referer && referer !== "/") {
        return res.redirect("back");
      }
      return res.redirect(fallbackRedirect);
    };

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creatorId = req.params.id;

      // 1. Retrieve the user first (do not delete yet!)
      const user = await User.findById(creatorId).session(session);
      if (!user) {
        req.flash("error", "Creator not found.");
        await session.abortTransaction();
        return safeRedirect();
      }

      // 2. Authenticate the deletion request
      // Assumes user.comparePassword returns a boolean or a promise resolving to one
      const isPasswordCorrect = await user.comparePassword(password);

      if (user.email !== email || !isPasswordCorrect) {
        req.flash("error", "Unauthorized to delete creator account. Incorrect email or password.");
        await session.abortTransaction();
        return safeRedirect();
      }

      // 3. Perform the cascading deletions inside the transaction
      await User.findByIdAndDelete(creatorId).session(session);
      await CreatorProfile.findOneAndDelete({ userId: creatorId }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      console.log(`Successfully deleted creator: ${creatorId}`);

      req.flash("success", "Creator account deleted successfully.");

      // Redirect cleanly to the intended page (e.g. the list of creators)
      return res.redirect(fallbackRedirect);

    } catch (error) {
      // Abort transaction on database/runtime error
      await session.abortTransaction();
      console.error("Deletion failed:", error);

      req.flash("error", "An internal error occurred while trying to delete the creator.");
      return safeRedirect();
    } finally {
      session.endSession();
    }
  }
}

export default new AdminController();