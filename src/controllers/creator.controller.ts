import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";
import { etInputToUtcDate, SCHEDULE_TIME_ZONE } from "../utils/etDateTime";
import mongoose from "mongoose";
import Busboy from "busboy";
import multer from "multer";

const MEDIA_FILE_FORM_FIELD_NAME = "media";

export class CreatorController {


  registerRoutes(router: Router) {
    router.get("/dashboard", asyncHandler(this.dashboard));
    router.get("/content", asyncHandler(this.contentList));
    router.get("/profile", asyncHandler(this.profile));

    //For previewing content
    router.get("/pages/preview", this.showNewContent);

    //For creating/editing/deleting content
    const upload = multer({ storage: multer.memoryStorage() }); //This is needed for express to understand the multipart form
    router.post("/pages/create", upload.single(MEDIA_FILE_FORM_FIELD_NAME), asyncHandler(this.post_createEditContent));
    router.post("/pages/:id/update", upload.single(MEDIA_FILE_FORM_FIELD_NAME), asyncHandler(this.post_createEditContent));
    router.delete("/pages/:id/delete", asyncHandler(this.deleteContent));

    //Page editor
    router.get("/pages/:id/editor", asyncHandler(this.showEditContent));
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


  showNewContent = async (req: Request, res: Response): Promise<void> => {
    res.render("creator/content-editor", {
      title: "New Content Page",
      contentPage: null,
      publicUrl: null,
      error: null
    });
  }

  post_createEditContent = async (req: Request, res: Response): Promise<void> => {
    const {
      body,
      status,
      scheduledFor,
      postID
    } = req.body;
    // console.log(req.headers["content-type"]);
    // console.log("UPDATE PAGE ", req.body);

    //TODO: Figure out why this doesn't work
    // Stream the media field from our form as a Readable stream
    const busboy = Busboy({ headers: req.headers });
    busboy.on("file", (fieldname:any, file:any, info:any) => {
      console.log("file:", fieldname, file, info);
      file.on("data", (chunk) => {
        console.log("received chunk", chunk.length);
      });

      file.on("end", () => {
        console.log("upload finished");
      });
    });
    busboy.on("field", (name:any, value:any) => {
      console.log("field:", name, value);
    });
    busboy.on("finish", () => {
      console.log("ALL DONE");
    });
    busboy.on("error", (err:any) => {
      console.error("Busboy error:", err);
    });
    req.pipe(busboy);



    const pageStatus = status || "published";
    const pageData = {
      creatorId: req.user._id,
      body,
      status: pageStatus,
      scheduledFor: pageStatus === "scheduled" ? etInputToUtcDate(scheduledFor) : null,
      scheduledTimeZone: pageStatus === "scheduled" ? SCHEDULE_TIME_ZONE : undefined,
      publishedAt: pageStatus === "published" ? new Date() : null
    };

    if (postID && mongoose.Types.ObjectId.isValid(postID)) { //editing
      //Find one and update it with the fields we have specified, first param is the filter, second is the update, third is options
      let contentPage = await ContentPage.findByIdAndUpdate(postID, pageData, { new: true });
      console.log("EDITED CONTENT PAGE", postID, contentPage);
      res.redirect(`/creator/pages/${postID}/editor`);
    } else { //creating
      let contentPage = await ContentPage.create(pageData);
      console.log("NEW CONTENT PAGE", contentPage);
      res.redirect(`/creator/content`);
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
export default new CreatorController();