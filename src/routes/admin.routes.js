import express from "express";
import asyncHandler from "../utils/asyncHandler";
import requireAuth from "../middleware/requireAuth";
import requireRole from "../middleware/requireRole";
import adminController from "../controllers/admin.controller";


const router = express.Router();

router.use(requireAuth);
router.use(requireRole("admin"));

//dashboard
router.get("/dashboard", asyncHandler(adminController.getDashboardView));

//creator list
router.get("/creators", asyncHandler(adminController.getCreatorsView));

//new creator
router.get("/creators/new",  asyncHandler(adminController.getEditCreatorsView));
router.post("/creators/new", asyncHandler(adminController.postNewCreator));

//edit creator
router.get("/edit-creator-account/:id", asyncHandler(adminController.getEditCreatorsView));
router.post("/edit-creator-account/:id", asyncHandler(adminController.postEditCreator));
router.get("/delete-creator-account/:id", asyncHandler(adminController.getDeleteCreator));

module.exports = router;
