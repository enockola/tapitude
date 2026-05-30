import ContentPage from "../models/ContentPage";
import CreatorProfile from "../models/CreatorProfile";
const {
  mockContentPages,
  mockProfile
} = require("../data/mockData");

async function dashboard(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    const contentPages = mockContentPages.slice(0, 5);

    return res.render("creator/dashboard", {
      title: "Creator Dashboard",
      contentPages,
      stats: {
        totalPages: mockContentPages.length,
        publishedPages: mockContentPages.filter((page) => page.status === "published").length,
        scheduledPages: mockContentPages.filter((page) => page.status === "scheduled").length
      }
    });
  }

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
  if (process.env.USE_MOCK_DATA === "true") {
    return res.render("creator/content-list", {
      title: "My Content",
      contentPages: mockContentPages
    });
  }

  const contentPages = await ContentPage.find({ creatorId: req.user._id })
    .sort({ updatedAt: -1 });

  res.render("creator/content-list", {
    title: "My Content",
    contentPages
  });
}

async function profile(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    return res.render("forms/profile", {
      title: "Profile",
      profile: mockProfile
    });
  }

  const profile = await CreatorProfile.findOne({ userId: req.user._id });

  res.render("forms/profile", {
    title: "Profile",
    profile
  });
}

module.exports = {
  dashboard,
  contentList,
  profile
};
