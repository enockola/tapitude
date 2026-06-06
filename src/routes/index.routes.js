import express from "express";
import indexController from "../controllers/index.controller";

const router = express.Router();
indexController.registerRoutes(router);

module.exports = router;
