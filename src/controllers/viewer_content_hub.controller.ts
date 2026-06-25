import { Request, Response, Router } from 'express';
import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
import asyncHandler from "../utils/asyncHandler";


export class ViewerContentHubController {

  registerRoutes(router: Router) {
    router.get("/", asyncHandler(this.home));
    router.get("/:slug", asyncHandler(this.home));
  }

  handleSocketConnection = (io: any, socket: any) => {
    console.log(`Viewer hub socket connected: ${socket.id}`);

    // Join a specific room for this "page" or "hub"
    socket.join('viewer_hub');
    const client = io.to('viewer_hub');

    socket.on('requestContent', async (data: any) => {
      //Get all the content for this creator
      const history = data.history;
      const creatorId = data.creatorId;

      //Get the content
      const contentPage = await ContentPage.findOne(
        { creatorId: creatorId, status: "published" }
      )
        .sort({ publishedAt: -1 })
        .skip(history);

      if (contentPage) {//Update analytics
        client.emit('requestContent', contentPage);
        console.log("GIVING CONTENT: ", contentPage);

        const updatedContentPage = await ContentPage.findOneAndUpdate(
          { creatorId: creatorId, viewedBy: { $ne: data.userId } },
          { $addToSet: { viewedBy: data.userId } },
          { new: true }
        );
        if (updatedContentPage) { //If the user has not viewed this before, update profile analytics
          await CreatorProfile.findOneAndUpdate(
            { userId: updatedContentPage.creatorId },
            { $inc: { totalViews: 1 } }
          );
        }
      } else client.emit('requestContent', null);
    });

    socket.on('likePost', async (data: any) => {
      const contentPage = await ContentPage.findOneAndUpdate({ _id: data.postId }, { $inc: { likes: data.liked ? 1 : -1 } }, { new: true });
      if (contentPage) {
        await CreatorProfile.findOneAndUpdate({ userId: contentPage.creatorId }, { $inc: { totalLikes: data.liked ? 1 : -1 } }, { new: true });
      }
    });

    socket.on('disconnect', () => {
      console.log('Viewer hub disconnected: ' + socket.id);
    });
  }

  home = async (req: Request, res: Response): Promise<void> => {
    if (req.params.slug) {
      console.log("CREATOR HUB SLUG: " + req.params.slug);
      const creatorProfile = await CreatorProfile.findOne({ creatorSlug: req.params.slug });
      if (creatorProfile) {
        return res.render("content_hub/index", {
          slug: req.params.slug,
          creatorProfile: creatorProfile
        });
      }
    }

    return res.status(404).render("errors/404", {
      title: "Content Hub page not found"
    });
  }
}

export default new ViewerContentHubController();