import ContentPage from "../models/ContentPage";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";
import { etInputToUtcDate, SCHEDULE_TIME_ZONE } from "../utils/etDateTime";
import mongoose from "mongoose";

export class CreatorContentController {

  registerRoutes(router: Router) {
    //For previewing content
    router.get("/new", this.showNewContent);
    //For creating/editing content
    router.post("/", asyncHandler(this.createEditContent));
    router.get("/:id/edit", asyncHandler(this.showEditContent));
    router.patch("/:id", asyncHandler(this.createEditContent));
    //For deleting content
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

  createEditContent = async (req: Request, res: Response): Promise<void> => {
    const {
      body,
      status,
      scheduledFor,
      postID
    } = req.body;

    const pageStatus = status || "published";
    const pageData = {
      creatorId: req.user._id,
      body,
      media: Buffer,
      status: pageStatus,
      scheduledFor: pageStatus === "scheduled" ? etInputToUtcDate(scheduledFor) : null,
      scheduledTimeZone: pageStatus === "scheduled" ? SCHEDULE_TIME_ZONE : undefined,
      publishedAt: pageStatus === "published" ? new Date() : null
    };

    if (postID == null) { //creating

      let contentPage = await ContentPage.create(pageData);
      console.log("NEW CONTENT PAGE", contentPage);

      res.redirect(`/content-pages/${contentPage._id}/edit`);
    } else if (postID && mongoose.Types.ObjectId.isValid(postID)) { //editing
      
      //Find one and update it with the fields we have specified, first param is the filter, second is the update, third is options
      let contentPage = await ContentPage.findByIdAndUpdate(postID, pageData, { new: true });
      console.log("EDITED CONTENT PAGE", postID,  contentPage);

      res.redirect(`/content-pages/${postID}/edit`);
    }
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
      publicUrl: null,
      error: null
    });
  }

  deleteContent = async (req: Request, res: Response): Promise<void> => {

    await ContentPage.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user._id
    });

    res.redirect("/creator/content");
  }
}

export default new CreatorContentController();