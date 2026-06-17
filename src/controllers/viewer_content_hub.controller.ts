import { Request, Response, Router } from 'express';
import asyncHandler from "../utils/asyncHandler";


export class ViewerContentHubController {

  registerRoutes(router: Router) {
    router.get("/", asyncHandler(this.home));
  }

  home = async (req: Request, res: Response): Promise<void> => {
    console.log("USER CONTENT HUB: Viewer home page");
    res.render("content_hub/index");
  }
}

export default new ViewerContentHubController();