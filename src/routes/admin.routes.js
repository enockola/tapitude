import express from "express";

import {requireAuth, requireRole} from "../middleware/requireAuth";
import adminController from "../controllers/admin.controller";

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin"));
adminController.registerRoutes(router);

module.exports = router;
