import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";
import { etInputToUtcDate, SCHEDULE_TIME_ZONE } from "../utils/etDateTime";
import mongoose from "mongoose";
import Busboy from "busboy";
import { FileServiceInstance } from '../models/FileService';

export class CreatorController {
  registerRoutes(router: Router) {
    router.get("/dashboard", asyncHandler(this.dashboard));
    router.get("/content", asyncHandler(this.contentList));
    router.get("/profile", asyncHandler(this.profile));

    //For previewing content
    router.get("/pages/preview", this.showNewContent);

    //For creating/editing/deleting content
    router.post("/pages/create", asyncHandler(this.post_createEditContent));
    router.post("/pages/:id/update", asyncHandler(this.post_createEditContent));
    router.post("/pages/upload", asyncHandler(this.post_uploadMedia));
    router.delete("/pages/:id/delete", asyncHandler(this.deleteContent));

    //Page editor
    router.get("/pages/:id/editor", asyncHandler(this.get_showEditContent));
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


  post_uploadMedia = async (req: Request, res: Response): Promise<void> => {
    // Stream the media field from our form as a Readable stream
    console.log("MEDIA UPLOAD POST REQUEST");
    // console.log(req.headers["content-type"]);
    // console.log(req.readableEnded); //Has the stream been read already?
    // console.log(req.complete);
    const fields: Record<string, string> = {};
    let uploadPromise: any = null;

    const busboy = Busboy({ headers: req.headers });
    busboy.on("file", (fieldname: any, file: any, info: any) => {
      console.log("file:", fieldname, info);

      if (!info.filename) { //If the file doesn't have a name, ignore it
        file.resume(); //Ignore the file
        return;
      }

      uploadPromise = FileServiceInstance.uploadFile({
        data: file,
        ownerId: req.user._id,
        contentType: info.mimeType,
        filename: info.filename
      });

      file.on("end", async () => {
        console.log("upload finished");
      });
    });
    busboy.on("field", (name: any, value: any) => {
      console.log("field:", name, value);
      fields[name] = value;
    });
    busboy.on("finish", async () => {
      console.log("request finished ", fields);
      let content;
      if (uploadPromise) {
        //Upload the file
        content = {
          fileKey: await uploadPromise
        };
      } else {
        //Delete the file
        content = {
          fileKey: null
        };
      }

      //If the content page already has a file, delete it
      let contentPage = await ContentPage.findByIdAndUpdate(fields.postID, { new: true });
      //If the content page already has a file, delete it
      if(contentPage?.fileKey) {
        await FileServiceInstance.deleteFile(contentPage.fileKey);
      }

      //Update the database with the file key
      contentPage = await ContentPage.findByIdAndUpdate(fields.postID, content, { new: true });
      console.log("\nUPDATED CONTENT PAGE", fields.postID, contentPage);
      res.redirect(`/creator/pages/${fields.postID}/editor`);
    });
    busboy.on("error", (err: any) => {
      console.error("Busboy error:", err);
    });
    req.pipe(busboy);

  }

  post_createEditContent = async (req: Request, res: Response): Promise<void> => {
    const { postID, body, status, scheduledFor } = req.body;
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
      console.log("\nEDITED CONTENT PAGE", postID, contentPage);
      res.redirect(`/creator/pages/${postID}/editor`);
    } else { //creating
      let contentPage = await ContentPage.create(pageData);
      console.log("\nNEW CONTENT PAGE", contentPage);
      res.redirect(`/creator/content`);
    }
  }

  get_showEditContent = async (req: Request, res: Response): Promise<void> => {
    let contentPage = null;

    if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) { //Get the ID parameter from the URL
      contentPage = await ContentPage.findOne({
        _id: req.params.id,
        creatorId: req.user._id
      });
    }
    if (!contentPage) {
      return res.status(404).render("errors/404", {
        title: "Content page not found"
      });
    }

    let fileMetadata = null;
    if (contentPage.fileKey) {
      fileMetadata = await FileServiceInstance.getFileMetadata(contentPage.fileKey);
    }
    res.render("creator/content-editor", {
      title: "Edit Content Page",
      contentPage,
      fileMetadata: fileMetadata,
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