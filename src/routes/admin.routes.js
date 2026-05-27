const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const requireAuth = require("../middleware/requireAuth");
const requireRole = require("../middleware/requireRole");
const adminController = require("../controllers/admin.controller");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

router.get("/dashboard", asyncHandler(adminController.dashboard));
router.get("/creators", asyncHandler(adminController.creators));
router.get("/creators/new", adminController.showCreateCreator);
router.post("/creators", asyncHandler(adminController.createCreator));

module.exports = router;
