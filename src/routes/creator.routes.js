const express = require("express");
import asyncHandler from "../utils/asyncHandler";
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const creatorController = require("../controllers/creator.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

router.get("/dashboard", asyncHandler(creatorController.dashboard));
router.get("/content", asyncHandler(creatorController.contentList));
router.get("/profile", asyncHandler(creatorController.profile));

module.exports = router;
