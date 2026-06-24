import User from "../models/User";
import CreatorProfile from "../models/CreatorProfile";
import ContentPage from "../models/ContentPage";
import mongoose from "mongoose";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";

export class AdminController {

  registerRoutes(router: Router) {
    router.get("/dashboard", asyncHandler(this.getDashboardView));
    router.get("/creators", asyncHandler(this.getCreatorsView));
    router.get("/creators/new", asyncHandler(this.getNewCreatorView));
    router.post("/creators/new", asyncHandler(this.postNewCreator));
    router.get("/edit-creator-account/:id", asyncHandler(this.getEditCreatorsView));
    router.post("/edit-creator-account/:id", asyncHandler(this.postEditCreator));
    router.get("/delete-creator-account/:id", asyncHandler(this.getDeleteCreator));
  }

  getDashboardView = async (req: Request, res: Response): Promise<void> => {
    const creatorCount = await User.countDocuments({ role: "creator" });
    const contentCount = await ContentPage.countDocuments();

    res.render("admin/dashboard", {
      title: "Admin Dashboard",
      creatorCount,
      contentCount
    });
  }

  getCreatorsView = async (req: Request, res: Response): Promise<void> => {
    const creators = await User.find({ role: "creator" }).sort({ createdAt: -1 });

    res.render("admin/creators", {
      title: "Creators",
      creators
    });
  }


  getEditCreatorsView = async (req: Request, res: Response): Promise<void> => {
    try {
      ///edit-creator-account/:id
      //We get the ID parameter, the routes makes it easy for us to get the ID
      const creator = await User.findById(req.params.id);
      const creatorProfile = await CreatorProfile.findOne({ userId: req.params.id });

      if (!creator || !creatorProfile) {
        res.status(404).send("Creator not found");
        return;
      }
      res.render("admin/edit-creator-account", {
        title: "Edit Creator Account",
        creator,
        creatorProfile
      });
    } catch (error) {
      res.status(500).send("Error loading creator profile");
    }
  }

  getNewCreatorView = async (req: Request, res: Response): Promise<void> => {
    res.render("admin/new-creator-account", {
      title: "Create Creator Account",
      error: null
    });
  }

  postNewCreator = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, brandName } = req.body;

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).render("admin/new-creator-account", {
        title: "Create Creator Account",
        error: "An account with this email already exists."
      });
    }

    const user = await User.createAccount({ name: name, email: email, password: password, role: "creator" });
    if (user === null) {
      throw new Error("Error creating creator account");
    }
    await CreatorProfile.create({
      userId: user._id,
      displayName: name,
      brandName
    });

    res.redirect("/admin/creators");
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

  getDeleteCreator = async (req: Request, res: Response): Promise<void> => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const creatorId = req.params.id;

      // 1. Delete the user
      const user = await User.findByIdAndDelete(creatorId).session(session);

      if (!user) {
        throw new Error("Creator not found");
      }

      // 2. Delete the associated profile
      await CreatorProfile.findOneAndDelete({ userId: creatorId }).session(session);

      // Commit the transaction
      await session.commitTransaction();
      console.log(`Successfully deleted creator: ${creatorId}`);

      res.redirect("/admin/creators");
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      console.error("Deletion failed:", error);
      res.status(500).send("Error deleting creator.");
    } finally {
      session.endSession();
    }
  }
}

export default new AdminController();