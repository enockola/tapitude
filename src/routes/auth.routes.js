const express = require("express");
import asyncHandler from "../utils/asyncHandler";
const authController = require("../controllers/auth.controller");

const router = express.Router();

router.get("/login", authController.showLogin);
router.post("/login", asyncHandler(authController.login));
router.post("/logout", authController.logout);

module.exports = router;
