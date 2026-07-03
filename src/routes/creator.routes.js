import express from "express";
import asyncHandler from "../utils/asyncHandler";
import {requireAuth, requireRole} from "../middleware/requireAuth";
import creatorController from "../controllers/creator.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

creatorController.registerRoutes(router);

module.exports = router;
