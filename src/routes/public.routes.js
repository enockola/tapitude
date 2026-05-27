const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const publicController = require("../controllers/public.controller");

const router = express.Router();

router.get("/:slug", asyncHandler(publicController.showPublicContent));

module.exports = router;
