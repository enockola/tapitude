import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";

export class CreatorController {

  registerRoutes(router: Router) {
    router.get("/dashboard", asyncHandler(this.dashboard));
    router.get("/content", asyncHandler(this.contentList));
    router.get("/profile", asyncHandler(this.profile));
  }

  dashboard = async (req: Request, res: Response): Promise<void> => {

    const contentPages = await ContentPage.find({ creatorId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5);

    const totalPages = await ContentPage.countDocuments({ creatorId: req.user._id });
    const publishedPages = await ContentPage.countDocuments({
      creatorId: req.user._id,
      status: "published"
    });
    const scheduledPages = await ContentPage.countDocuments({
      creatorId: req.user._id,
      status: "scheduled"
    });

    res.render("creator/dashboard", {
      title: "Creator Dashboard",
      contentPages,
      stats: {
        totalPages,
        publishedPages,
        scheduledPages
      }
    });
  }

  contentList = async (req: Request, res: Response): Promise<void> => {
    const contentPages = await ContentPage.find({ creatorId: req.user._id })
      .sort({ updatedAt: -1 });

    res.render("creator/content-list", {
      title: "My Content",
      contentPages
    });
  }

  profile = async (req: Request, res: Response): Promise<void> => {
    const profile = await CreatorProfile.findOne({ userId: req.user._id });

    res.render("creator/profile", {
      title: "Profile",
      profile
    });
  }
}
export default new CreatorController();