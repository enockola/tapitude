import ContentPage from "../models/ContentPage";
import createSlug from "../utils/createSlug";
import generatePublicUrl from "../utils/generatePublicUrl";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";


export class ContentController {

  registerRoutes(router: Router) {
    router.get("/new", this.showNewContent);
    router.post("/", asyncHandler(this.createContent));
    router.get("/:id/edit", asyncHandler(this.showEditContent));
    router.patch("/:id", asyncHandler(this.updateContent));
    router.delete("/:id", asyncHandler(this.deleteContent));
  }

  showNewContent = async (req: Request, res: Response): Promise<void> => {
    res.render("creator/content-editor", {
      title: "New Content Page",
      contentPage: null,
      publicUrl: null,
      error: null
    });
  }

  createContent = async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      body,
      buttonText,
      externalLink,
      embedUrl,
      embedType,
      status,
      scheduledFor
    } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).render("creator/content-editor", {
        title: "New Content Page",
        contentPage: null,
        publicUrl: null,
        error: "Title is required."
      });
    }

    const pageStatus = status || "published";

    const contentPage = await ContentPage.create({
      creatorId: req.user._id,
      title,
      slug: createSlug(title),
      body,
      buttonText,
      externalLink,
      embedUrl,
      embedType: embedType || "none",
      status: pageStatus,
      scheduledFor: pageStatus === "scheduled" && scheduledFor ? new Date(scheduledFor) : null,
      publishedAt: pageStatus === "published" ? new Date() : null
    });

    res.redirect(`/content-pages/${contentPage._id}/edit`);
  }

  showEditContent = async (req: Request, res: Response): Promise<void> => {
    const contentPage = await ContentPage.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    });

    if (!contentPage) {
      return res.status(404).render("errors/404", {
        title: "Content page not found"
      });
    }

    res.render("creator/content-editor", {
      title: "Edit Content Page",
      contentPage,
      publicUrl:
        contentPage.status === "published"
          ? generatePublicUrl(contentPage.slug)
          : null,
      error: null
    });
  }

  updateContent = async (req: Request, res: Response): Promise<void> => {
    const {
      title,
      body,
      buttonText,
      externalLink,
      embedUrl,
      embedType,
      status,
      scheduledFor
    } = req.body;

    const updates: Record<string, any> = {
      title,
      body,
      buttonText,
      externalLink,
      embedUrl,
      embedType: embedType || "none",
      status
    };

    if (status === "scheduled") {
      updates.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
      updates.publishedAt = null;
    }

    if (status === "published") {
      updates.scheduledFor = null;
      updates.publishedAt = new Date();
    }

    await ContentPage.findOneAndUpdate(
      { _id: req.params.id, creatorId: req.user._id },
      updates,
      { runValidators: true }
    );

    res.redirect(`/content-pages/${req.params.id}/edit`);
  }

  deleteContent = async (req: Request, res: Response): Promise<void> => {

    await ContentPage.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user._id
    });

    res.redirect("/creator/content");
  }
}

export default new ContentController();