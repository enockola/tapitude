const ContentPage = require("../models/ContentPage");
const createSlug = require("../utils/createSlug");
const generatePublicUrl = require("../utils/generatePublicUrl");
const {
  mockContentPages,
  addMockContentPage,
  updateMockContentPage,
  deleteMockContentPage
} = require("../data/mockData");

function showNewContent(req, res) {
  res.render("creator/content-editor", {
    title: "New Content Page",
    contentPage: null,
    publicUrl: null,
    error: null
  });
}

async function createContent(req, res) {
  const {
    title,
    body,
    buttonText,
    externalLink,
    embedUrl,
    embedType,
    status,
    scheduledFor
  } = req.body;

  const pageStatus = status || "published";

  if (process.env.USE_MOCK_DATA === "true") {
    const page = addMockContentPage({
      creatorId: req.user._id,
      title,
      slug: createSlug(title),
      body,
      buttonText,
      externalLink,
      embedUrl,
      embedType: embedType || "none",
      status: pageStatus,
      scheduledFor: pageStatus === "scheduled" && scheduledFor ? new Date(scheduledFor) : null,
      publishedAt: pageStatus === "published" ? new Date() : null
    });

    return res.redirect(`/content-pages/${page._id}/edit`);
  }

  const contentPage = await ContentPage.create({
    creatorId: req.user._id,
    title,
    slug: createSlug(title),
    body,
    buttonText,
    externalLink,
    embedUrl,
    embedType: embedType || "none",
    status: pageStatus,
    scheduledFor: pageStatus === "scheduled" && scheduledFor ? new Date(scheduledFor) : null,
    publishedAt: pageStatus === "published" ? new Date() : null
  });

  res.redirect(`/content-pages/${contentPage._id}/edit`);
}

async function showEditContent(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    const contentPage = mockContentPages.find((page) => page._id === req.params.id);

    if (!contentPage) {
      return res.status(404).render("errors/404", {
        title: "Content page not found"
      });
    }

    return res.render("creator/content-editor", {
      title: "Edit Content Page",
      contentPage,
      publicUrl: generatePublicUrl(contentPage.slug),
      error: null
    });
  }

  const contentPage = await ContentPage.findOne({
    _id: req.params.id,
    creatorId: req.user._id
  });

  if (!contentPage) {
    return res.status(404).render("errors/404", {
      title: "Content page not found"
    });
  }

  res.render("creator/content-editor", {
    title: "Edit Content Page",
    contentPage,
    publicUrl: generatePublicUrl(contentPage.slug),
    error: null
  });
}

async function updateContent(req, res) {
  const {
    title,
    body,
    buttonText,
    externalLink,
    embedUrl,
    embedType,
    status,
    scheduledFor
  } = req.body;

  const updates = {
    title,
    body,
    buttonText,
    externalLink,
    embedUrl,
    embedType: embedType || "none",
    status
  };

  if (status === "scheduled") {
    updates.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    updates.publishedAt = null;
  }

  if (status === "published") {
    updates.scheduledFor = null;
    updates.publishedAt = new Date();
  }

  if (process.env.USE_MOCK_DATA === "true") {
    updateMockContentPage(req.params.id, updates);
    return res.redirect(`/content-pages/${req.params.id}/edit`);
  }

  await ContentPage.findOneAndUpdate(
    { _id: req.params.id, creatorId: req.user._id },
    updates,
    { runValidators: true }
  );

  res.redirect(`/content-pages/${req.params.id}/edit`);
}

async function deleteContent(req, res) {
  if (process.env.USE_MOCK_DATA === "true") {
    deleteMockContentPage(req.params.id);
    return res.redirect("/creator/content");
  }

  await ContentPage.findOneAndDelete({
    _id: req.params.id,
    creatorId: req.user._id
  });

  res.redirect("/creator/content");
}

module.exports = {
  showNewContent,
  createContent,
  showEditContent,
  updateContent,
  deleteContent
};
