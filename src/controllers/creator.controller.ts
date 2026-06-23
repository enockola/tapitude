import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import { Request, Response, Router } from 'express';
import { asyncHandler, busboy_getRequest } from "../utils/asyncHandler";
import { etInputToUtcDate, SCHEDULE_TIME_ZONE } from "../utils/etDateTime";
import mongoose from "mongoose";
import Busboy from "busboy";
import { FileServiceInstance } from '../models/FileService';

export class CreatorController {
  registerRoutes(router: Router) {
    router.get("/dashboard", asyncHandler(this.dashboard));
    router.get("/content", asyncHandler(this.contentList));


    //For previewing content
    router.get("/pages/preview", this.showNewContent);

    //For creating/editing/deleting content
    router.post("/pages/create", asyncHandler(this.post_createEditContent));
    router.post("/pages/:id/update", asyncHandler(this.post_createEditContent));
    router.post("/pages/upload", asyncHandler(this.post_uploadMedia));
    router.post("/pages/:id/delete", asyncHandler(this.post_deleteContent));

    //Page editor
    router.get("/pages/:id/editor", asyncHandler(this.get_createEditContent));
    router.get("/pages/editor", asyncHandler(this.get_createEditContent));

    router.get("/profile", asyncHandler(this.get_profile));
    router.post("/profile/update", asyncHandler(this.post_updateProfile));
  }


  post_deleteContent = async (req: Request, res: Response): Promise<void> => {
    console.log("\nDELETING CONTENT PAGE", req.params.id);
    await ContentPage.findOneAndDelete({
      _id: req.params.id,
      creatorId: req.user._id
    });
    res.redirect(`/creator/content`);
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



  showNewContent = async (req: Request, res: Response): Promise<void> => {
    res.render("creator/content-editor", {
      title: "New Content Page",
      contentPage: null,
      publicUrl: null,
      error: null
    });
  }


  get_profile = async (req: Request, res: Response): Promise<void> => {
    const profile = await CreatorProfile.findOne({ userId: req.user._id });
    if (!profile) {
      return res.status(404).render("errors/404", {
        title: "Profile not found"
      });
    }
    let profileImageMetadata = null;
    if(profile.profileImageKey){
      profileImageMetadata = await FileServiceInstance.getFileMetadata(profile.profileImageKey);
      console.log("PROFILE IMAGE METADATA", profileImageMetadata);
    }

    res.render("creator/profile", {
      title: "Profile",
      profileImageMetadata,
      profile
    });
  }


  post_updateProfile = async (req: Request, res: Response): Promise<void> => {
    let updatedDate = new Date();
    let content: any = {
      updatedAt: updatedDate
    };

    busboy_getRequest(req, res,
      async (fieldname, data, filename, mimeType) => { //On file
        console.log("FILE", fieldname);
        // console.log("FILENAME", filename);
        // console.log("DATA", data);
        // console.log("MIMETYPE", mimeType);
        content.profileImageKey = await FileServiceInstance.uploadFile({
          data: data,
          ownerId: req.user._id,
          filename: filename,
          contentType: mimeType
        });
      },
      async (fields) => { //On finish
        console.log("FIELDS", fields);
        content.displayName = fields.displayName;
        content.brandName = fields.brandName;
        content.brandColor = fields.brandColor;
        content.bio = fields.bio;

        const profile = await CreatorProfile.findOneAndUpdate({ userId: req.user._id }, content, { new: true });
        if (!profile) {
          return res.status(404).render("errors/404", {
            title: "Profile not found"
          });
        } else {
          console.log(profile);
          res.redirect("/creator/profile");
        }
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
      if (contentPage?.fileKey) {
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

  get_createEditContent = async (req: Request, res: Response): Promise<void> => {

    //edit document
    if (req.params.id && mongoose.Types.ObjectId.isValid(req.params.id)) { //Get the ID parameter from the URL
      let contentPage = await ContentPage.findOne({
        _id: req.params.id,
        creatorId: req.user._id
      });

      if (!contentPage) {
        return res.status(404).render("errors/404", {
          title: "Content not found"
        });
      }
      //Get the file metadata, because the frontend needs it
      let fileMetadata = null;
      if (contentPage.fileKey) {
        fileMetadata = await FileServiceInstance.getFileMetadata(contentPage.fileKey);
      }
      res.render("creator/content-editor", {
        title: "Edit Content Page",
        contentPage: contentPage,
        fileMetadata: fileMetadata,
        error: null
      });
    } else { //new document
      res.render("creator/content-editor", {
        title: "New Content Page",
        fileMetadata: null,
        contentPage: null,
        error: null
      });
    }
  }


}
export default new CreatorController();