const express = require("express");
const pageController = require("../controllers/page.controller");

const router = express.Router();

router.get("/", pageController.home);
router.get("/about", pageController.about);

module.exports = router;
