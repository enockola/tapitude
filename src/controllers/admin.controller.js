const bcrypt = require("bcryptjs");
const User = require("../models/User");
const CreatorProfile = require("../models/CreatorProfile");
const ContentPage = require("../models/ContentPage");
const {
  mockCreators,
  mockContentPages,
  addMockCreator
} = require("../data/mockData");

async function dashboard(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    return res.render("admin/dashboard", {
      title: "Admin Dashboard",
      creatorCount: mockCreators.length,
      contentCount: mockContentPages.length
    });
  }

  const creatorCount = await User.countDocuments({ role: "creator" });
  const contentCount = await ContentPage.countDocuments();

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    creatorCount,
    contentCount
  });
}

async function creators(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    return res.render("admin/creators", {
      title: "Creators",
      creators: mockCreators
    });
  }

  const creators = await User.find({ role: "creator" }).sort({ createdAt: -1 });

  res.render("admin/creators", {
    title: "Creators",
    creators
  });
}

function showCreateCreator(req, res) {
  res.render("forms/creator-account", {
    title: "Create Creator Account",
    error: null
  });
}

/**
 * Creates a new creator account
 * @param {the input for the creator account} req 
 * @param {redirects the admin to the creators page} res 
 * @returns 
 */
async function createCreator(req, res) {
  const { name, email, password, brandName } = req.body;

  const existingUser = await User.findOne({ email: email?.toLowerCase().trim() });
  if (existingUser) {
    return res.status(400).render("forms/creator-account", {
      title: "Create Creator Account",
      error: "An account with this email already exists."
    });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "creator",
    status: "active"
  });

  await CreatorProfile.create({
    userId: user._id,
    displayName: name,
    brandName
  });

  res.redirect("/admin/creators");
}

module.exports = {
  dashboard,
  creators,
  showCreateCreator,
  createCreator
};
