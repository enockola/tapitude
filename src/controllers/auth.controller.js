const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { findMockUserByEmail } = require("../data/mockData");

function showLogin(req, res) {
  res.render("forms/login", {
    title: "Log in",
    error: null
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (process.env.USE_MOCK_DATA === "true") {
    const mockUser = findMockUserByEmail(email);

    if (!mockUser) {
      return res.status(401).render("forms/login", {
        title: "Log in",
        error: "Use admin@tapitude.test or creator@tapitude.test in mock mode."
      });
    }

    req.session.userId = mockUser._id;

    if (mockUser.role === "admin") {
      return res.redirect("/admin/dashboard");
    }

    return res.redirect("/creator/dashboard");
  }

  const user = await User.findOne({ email: email?.toLowerCase().trim() });

  if (!user || user.status !== "active") {
    return res.status(401).render("forms/login", {
      title: "Log in",
      error: "Invalid email or password."
    });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    return res.status(401).render("forms/login", {
      title: "Log in",
      error: "Invalid email or password."
    });
  }

  req.session.userId = user._id.toString();

  if (user.role === "admin") {
    return res.redirect("/admin/dashboard");
  }

  return res.redirect("/creator/dashboard");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie("tapitude.sid");
    res.redirect("/");
  });
}

module.exports = {
  showLogin,
  login,
  logout
};
