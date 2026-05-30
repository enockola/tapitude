import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import creatorController from "../controllers/creator.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

router.get("/dashboard", asyncHandler(creatorController.dashboard));
router.get("/content", asyncHandler(creatorController.contentList));
router.get("/profile", asyncHandler(creatorController.profile));

module.exports = router;
