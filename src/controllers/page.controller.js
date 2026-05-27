function home(req, res) {
  res.render("home", {
    title: "Tapitude"
  });
}

function about(req, res) {
  res.render("about", {
    title: "About Tapitude"
  });
}

module.exports = {
  home,
  about
};
