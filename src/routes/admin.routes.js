import express from "express";

import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import adminController from "../controllers/admin.controller";

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("admin"));
adminController.registerRoutes(router);

module.exports = router;
