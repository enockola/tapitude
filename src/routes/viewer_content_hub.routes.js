import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import viewerController from "../controllers/viewer_content_hub.controller";

const router = express.Router();
viewerController.registerRoutes(router);
router.handleSocketConnection = viewerController.handleSocketConnection;

module.exports = router;
