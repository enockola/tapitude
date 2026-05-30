import express from "express";
import pageController from "../controllers/page.controller";

const router = express.Router();
pageController.registerRoutes(router);

module.exports = router;
