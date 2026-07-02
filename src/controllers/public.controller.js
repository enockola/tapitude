import ContentPage from "../models/ContentPage";

async function showPublicContent(req, res) {
  const now = new Date();

  if (process.env.USE_MOCK_DATA === "true") {
    const contentPage = mockData.mockContentPages.find((page) => {
      return page.slug === req.params.slug
        && page.status === "published"
        && (!page.publishDate || new Date(page.publishDate) <= now);
    });

    if (!contentPage) {
      return res.status(404).render("errors/404", {
        title: "Content not found"
      });
    }

    return res.render("public/content-page", {
      title: contentPage.title,
      contentPage
    });
  }

  const contentPage = await ContentPage.findOne({
    slug: req.params.slug,
    status: "published",
    $or: [
      { publishDate: { $lte: now } },
      { publishDate: null }
    ]
  });

  if (!contentPage) {
    return res.status(404).render("errors/404", {
      title: "Content not found"
    });
  }

  res.render("public/content-page", {
    title: contentPage.title,
    contentPage
  });
}

module.exports = {
  showPublicContent
};
