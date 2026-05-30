import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import contentController from "../controllers/content.controller";

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("creator", "admin"));

router.get("/new", contentController.showNewContent);
router.post("/", asyncHandler(contentController.createContent));
router.get("/:id/edit", asyncHandler(contentController.showEditContent));
router.patch("/:id", asyncHandler(contentController.updateContent));
router.delete("/:id", asyncHandler(contentController.deleteContent));

module.exports = router;
