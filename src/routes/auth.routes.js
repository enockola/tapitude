import express from "express";
import asyncHandler from "../utils/asyncHandler";
import authController from "../controllers/auth.controller";

const router = express.Router();
authController.registerRoutes(router);

module.exports = router;
