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

    socket.on('chat message', (msg) => {
      // Only emit to users in this specific hub/room
      io.to('viewer_hub').emit('chat message', msg);
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

        const contentPages = await ContentPage.find({ creatorId: creatorProfile.userId })
          .sort({ updatedAt: -1 })
          .limit(1);

        return res.render("content_hub/index", {
          slug: req.params.slug,
          creatorProfile: creatorProfile,
          contentPages
        });
      }
    }

    return res.status(404).render("errors/404", {
      title: "Content Hub page not found"
    });
  }
}

export default new ViewerContentHubController();