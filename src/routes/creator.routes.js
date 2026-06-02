import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import creatorController from "../controllers/creator.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

creatorController.registerRoutes(router);

module.exports = router;
