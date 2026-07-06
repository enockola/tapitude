import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import { Request, Response, Router } from 'express';
import { asyncHandler, busboy_getRequest } from "../utils/asyncHandler";
import { etInputToUtcDate, SCHEDULE_TIME_ZONE } from "../utils/timezoneUtils";
import mongoose from "mongoose";
import Busboy from "busboy";
import { FileServiceInstance } from '../models/FileService';
import { creatorCheck } from '../middleware/security.js';
import { logger } from '../utils/loggingUtils.js';

const MAX_CONTENT_PAGES_PER_CREATOR = 25;
const isProduction = process.env.NODE_ENV === "production";

function describeContentPage(contentPage: any): string {
  if (!contentPage) {
    return "";
  }

  const descriptionParts: string[] = [];
  if (contentPage.body) {
    const body = String(contentPage.body);
    descriptionParts.push(body.length > 50 ? `${body.slice(0, 50)}...` : body);
  }
  if (contentPage.fileKey) {
    descriptionParts.push("1 attachment");
  }

  return descriptionParts.length > 0 ? descriptionParts.join(" / ") : "Untitled post";
}

async function deleteContentPageWithMedia(contentPage: any): Promise<void> {
  if (!contentPage) {
    return;
  }

  if (contentPage.fileKey) {
    try {
      await FileServiceInstance.deleteFile(contentPage.fileKey);
    } catch (error) {
      logger.error({ error, fileKey: contentPage.fileKey, contentPageId: contentPage._id },
         `Failed to delete media for content page ${contentPage._id}`);
    }
  }

  await ContentPage.deleteOne({
    _id: contentPage._id,
    creatorId: contentPage.creatorId
  });
}

async function enforceContentPageLimit(creatorId: any, newestContentPageId: any): Promise<any[]> {
  const overflowCount = await ContentPage.countDocuments({ creatorId }) - MAX_CONTENT_PAGES_PER_CREATOR;
  if (overflowCount <= 0) {
    return [];
  }

  const oldestContentPages = await ContentPage.find({
    creatorId,
    _id: { $ne: newestContentPageId }
  })
    .sort({ createdAt: 1, _id: 1 })
    .limit(overflowCount);

  for (const contentPage of oldestContentPages) {
    await deleteContentPageWithMedia(contentPage);
  }

  return oldestContentPages;
}

async function getContentPageLimitInfo(creatorId: any) {
  const currentCount = await ContentPage.countDocuments({ creatorId });
  const oldestContentPage = currentCount >= MAX_CONTENT_PAGES_PER_CREATOR
    ? await ContentPage.findOne({ creatorId }).sort({ createdAt: 1, _id: 1 })
    : null;

  return {
    max: MAX_CONTENT_PAGES_PER_CREATOR,
    currentCount,
    atLimit: currentCount >= MAX_CONTENT_PAGES_PER_CREATOR,
    postsToDeleteOnCreate: Math.max(currentCount + 1 - MAX_CONTENT_PAGES_PER_CREATOR, 1),
    oldestPostLabel: describeContentPage(oldestContentPage)
  };
}

export class CreatorController {
  registerRoutes(router: Router) {
    router.get("/dashboard", creatorCheck, asyncHandler(this.dashboard)); //dashboard
    router.get("/content", creatorCheck, asyncHandler(this.contentList)); //content list
    router.get("/pages/:id/editor", creatorCheck, asyncHandler(this.get_createEditContent)); //Page editor

    router.get("/profile", creatorCheck, asyncHandler(this.get_profile)); //Profile editor
    router.post("/profile/update", creatorCheck, asyncHandler(this.post_updateProfile)); //We already preform a manual CSRF check inside this function

    //For creating/editing/deleting content
    router.post("/pages/new-page", creatorCheck, asyncHandler(this.post_newPost));
    router.post("/pages/create", creatorCheck, asyncHandler(this.post_editPost));
    router.post("/pages/:id/update", creatorCheck, asyncHandler(this.post_editPost));
    router.post("/pages/upload", creatorCheck, asyncHandler(this.post_uploadMedia));
    router.post("/pages/:id/delete", creatorCheck, asyncHandler(this.post_deleteContent));
  }



  post_deleteContent = async (req: Request, res: Response): Promise<void> => {
    console.log("\nDELETING CONTENT PAGE", req.params.id);
    const contentPage = await ContentPage.findOne({
      _id: req.params.id,
      creatorId: req.user._id
    });

    await deleteContentPageWithMedia(contentPage);
    res.redirect(`/creator/content`);
  }

  dashboard = async (req: Request, res: Response): Promise<void> => {

    const creatorProfile = await CreatorProfile.findOne({ userId: req.user._id });
    if (!creatorProfile) {
      return res.status(404).render("errors/404", {
        title: "Dashboard not found"
      });
    }

    const contentPages = await ContentPage.find({ creatorId: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(5);
    console.log("\nCREATOR DASHBOARD ", contentPages);

    //Analytics
    const totalPages = await ContentPage.countDocuments({ creatorId: req.user._id });
    const publishedPages = await ContentPage.countDocuments({
      creatorId: req.user._id,
      status: "published"
    });
    //Some analytics should exist independently of the posts that are created since the posts will be deleted
    const totalViews = creatorProfile.totalViews ? creatorProfile.totalViews : 0;
    const totalLikes = creatorProfile.totalLikes ? creatorProfile.totalLikes : 0;

    res.render("creator/dashboard", {
      title: "Creator Dashboard",
      contentPages,

      stats: {
        totalPages,
        publishedPages,
        totalLikes,
        totalViews
      }
    });
  }

  contentList = async (req: Request, res: Response): Promise<void> => {
    const contentPages = await ContentPage.find({ creatorId: req.user._id })
      .sort({ updatedAt: -1 });
    const contentPageLimit = await getContentPageLimitInfo(req.user._id);

    res.render("creator/content-list", {
      title: "My Content",
      contentPages,
      contentPageLimit
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
    if (profile.profileImageKey) {
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
        content.brandDarkMode = fields.brandDarkMode;

        const origProfile = await CreatorProfile.findOneAndUpdate({ userId: req.user._id }, content, { new: false });
        if (!origProfile) {
          return res.status(404).render("errors/404", {
            title: "Profile not found"
          });
        } else {
          //If the profile image has changed, delete the old one
          if (origProfile.profileImageKey
            && content.profileImageKey
            && origProfile.profileImageKey !== content.profileImageKey) {
            try {
              //Delete the old profile image
              await FileServiceInstance.deleteFile(origProfile.profileImageKey);
            } catch (error) {
              logger.error({error, fileKey: origProfile.profileImageKey}, "Error deleting old profile image:");
            }
          }
          res.redirect("/creator/profile");
        }
      });
  }

  post_uploadMedia = async (req: Request, res: Response): Promise<void> => {
    // Stream the media field from our form as a Readable stream
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
        logger.debug("upload finished");
      });
    });
    busboy.on("field", (name: any, value: any) => {
      fields[name] = value;
    });
    busboy.on("finish", async () => {
      console.log("request finished ", fields);
      if (!fields.postID || !mongoose.Types.ObjectId.isValid(fields.postID)) {
        return res.status(404).render("errors/404", {
          title: "Post not found"
        });
      }
      let fileKey = null;

      if (uploadPromise) {
        //Upload the file
        fileKey = await uploadPromise;
      } else {
        //Delete the file
        fileKey = null;
      }

      //If the content page already has a file, delete it
      let contentPage = await ContentPage.findByIdAndUpdate(fields.postID, { new: true });
      //If the content page already has a file, delete it
      if (contentPage?.fileKey) {
        await FileServiceInstance.deleteFile(contentPage.fileKey);
      }

      //Update the database with the file key
      contentPage = await ContentPage.findByIdAndUpdate(
        fields.postID,
        {
          fileKey: fileKey
        },
        { new: true });
      res.redirect(`/creator/pages/${fields.postID}/editor`);
    });
    busboy.on("error", (err: any) => {
      console.error("Busboy error:", err);
    });
    req.pipe(busboy);

  }

  post_editPost = async (req: Request, res: Response): Promise<void> => {
    const { postID, body, status, scheduledFor, aspectRatioMode } = req.body;
    //Convert scheduled status to published
    const pageStatus = status === "scheduled" ? "published" : status;
    let preserveAspectRatio = null;
    if (aspectRatioMode !== null && aspectRatioMode !== "auto") {
      preserveAspectRatio = aspectRatioMode === "true";
    }



    if (postID && mongoose.Types.ObjectId.isValid(postID)) { //editing
      //Find one and update it with the fields we have specified, first param is the filter, second is the update, third is options
      let contentPage = await ContentPage.findOneAndUpdate({
        _id: postID,
        creatorId: req.user._id
      },
        {
          creatorId: req.user._id,
          body,
          //Status can only be "published" or "scheduled"
          status: pageStatus,
          publishDate: scheduledFor ? etInputToUtcDate(scheduledFor) : new Date(),
          preserveAspectRatio: preserveAspectRatio
        }
        , { new: true });
      if (!contentPage) {
        return res.status(404).render("errors/404", {
          title: "Content not found"
        });
      }
      console.log("\nEDITED CONTENT PAGE", postID, contentPage);
      res.redirect(`/creator/pages/${postID}/editor?saved=1`);
    } else {
      return res.status(404).render("errors/404", {
        title: "Post not found"
      });
    }
  }



  get_createEditContent = async (req: Request, res: Response): Promise<void> => {
    if (!req.params.id || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).render("errors/404", {
        title: "Post not found"
      });
    }
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
      contentPageLimit: await getContentPageLimitInfo(req.user._id),
      success: req.query.saved === "1" ? "Post saved." : null,
      error: null
    });
  }

  post_newPost = async (req: Request, res: Response): Promise<void> => {
    let contentPage = await ContentPage.create({
      creatorId: req.user._id,
      //Because there are no drafts, we can just set the status to "published" otherwise it will be public instantly.
      //The user has 24 hours to publish it
      publishDate: new Date(new Date().getTime() + (24 * 60 * 60 * 1000))
    });

    //Delete the oldest content pages if we are over the post limit
    const deletedContentPages = await enforceContentPageLimit(req.user._id, contentPage._id);
    if (deletedContentPages.length > 0) {
      console.log(`Deleted ${deletedContentPages.length} oldest content page(s) after creating ${contentPage._id}.`);
    }
    res.redirect(`/creator/pages/${contentPage._id}/editor`);//Redirect to the editor
  }


}
export default new CreatorController();
