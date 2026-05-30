import User from "../models/User";

function showLogin(req, res) {
  res.render("forms/login", {
    title: "Log in",
    error: null
  });
}

/**
 * Authenticates the user
 * @param {The request} req 
 * @param {The response} res 
 * @returns 
 */
async function login(req, res) {
  //First we get the request
  const { email, password } = req.body;

  //We get the user from the User model
  const user = await User.findOne({ email: email?.toLowerCase().trim() });
  // console.log("The user is: ", user);

  if (!user || user.status !== "active") {
    return res.status(401).render("forms/login", {
      title: "Log in",
      error: "User account not found."
    });
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    return res.status(401).render("forms/login", {
      title: "Log in",
      error: "Invalid email or password."
    });
  }

  req.session.userId = user._id.toString();

  //We automatically redirect the user based on their role
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
