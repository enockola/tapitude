import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
const {
  mockContentPages,
  mockProfile
} = require("../data/mockData");

async function dashboard(req, res) {
  const contentPages = await ContentPage.find({ creatorId: req.user._id })
    .sort({ updatedAt: -1 })
    .limit(5);

  const totalPages = await ContentPage.countDocuments({ creatorId: req.user._id });
  const publishedPages = await ContentPage.countDocuments({
    creatorId: req.user._id,
    status: "published"
  });
  const scheduledPages = await ContentPage.countDocuments({
    creatorId: req.user._id,
    status: "scheduled"
  });

  res.render("creator/dashboard", {
    title: "Creator Dashboard",
    contentPages,
    stats: {
      totalPages,
      publishedPages,
      scheduledPages
    }
  });
}

async function contentList(req, res) {
  const contentPages = await ContentPage.find({ creatorId: req.user._id })
    .sort({ updatedAt: -1 });

  res.render("creator/content-list", {
    title: "My Content",
    contentPages
  });
}

async function profile(req, res) {
  const profile = await CreatorProfile.findOne({ userId: req.user._id });

  res.render("creator/profile", {
    title: "Profile",
    profile
  });
}

module.exports = {
  dashboard,
  contentList,
  profile
};
