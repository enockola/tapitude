import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import contentController from "../controllers/content.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

contentController.registerRoutes(router);

module.exports = router;
