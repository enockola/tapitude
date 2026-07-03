function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(500).render("errors/500", {
    title: "Server error",
    error: process.env.NODE_ENV === "development" ? error : null
  });
}

function notFound(req, res) {
  res.status(404).render("errors/404", {
    title: "Page not found"
  });
}

module.exports = { errorHandler, notFound };
