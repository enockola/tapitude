const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const contentController = require("../controllers/content.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

router.get("/new", contentController.showNewContent);
router.post("/", asyncHandler(contentController.createContent));
router.get("/:id/edit", asyncHandler(contentController.showEditContent));
router.patch("/:id", asyncHandler(contentController.updateContent));
router.delete("/:id", asyncHandler(contentController.deleteContent));

module.exports = router;
