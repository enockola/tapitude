import asyncHandler from "../utils/asyncHandler";
import { Request, Response, Router } from 'express';

export class PageController {
  registerRoutes(router: Router) {
    router.get("/", this.home);
    router.get("/about", this.about);
  }

  home = async (req: Request, res: Response): Promise<void> => {
    res.render("home", {
      title: "Tapitude"
    });
  }

  about = async (req: Request, res: Response): Promise<void> => {
    res.render("about", {
      title: "About Tapitude"
    });
  }
}

export default new PageController();