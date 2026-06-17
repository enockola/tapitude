import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import CreatorContentController from "../controllers/creator_content.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

CreatorContentController.registerRoutes(router);

module.exports = router;
