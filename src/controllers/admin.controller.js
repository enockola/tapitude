import User from "../models/User";
import CreatorProfile from "../models/CreatorProfile";
import ContentPage from "../models/ContentPage";
import mongoose from "mongoose";

//---------------------------
// GET requests
//---------------------------

async function getDashboardView(req, res) {
  console.log("RENDERING renderDashboardView");
  const creatorCount = await User.countDocuments({ role: "creator" });
  const contentCount = await ContentPage.countDocuments();

  res.render("admin/dashboard", {
    title: "Admin Dashboard",
    creatorCount,
    contentCount
  });
}

async function getCreatorsView(req, res) {
  const creators = await User.find({ role: "creator" }).sort({ createdAt: -1 });

  res.render("admin/creators", {
    title: "Creators",
    creators
  });
}


async function getEditCreatorsView(req, res) {
  try {
    ///edit-creator-account/:id
    //We get the ID parameter, the routes makes it easy for us to get the ID
    const creator = await User.findById(req.params.id);

    if (!creator) {
      return res.status(404).send("Creator not found");
    }
    res.render("admin/edit-creator-account", {
      title: "Edit Creator Account",
      creator
    });
  } catch (error) {
    res.status(500).send("Error loading creator profile");
  }
}

function getNewCreatorView(req, res) {
  res.render("admin/new-creator-account", {
    title: "Create Creator Account",
    error: null
  });
}

//---------------------------
// POST requests
//---------------------------

async function postNewCreator(req, res) {
  const { name, email, password, brandName } = req.body;

  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).render("admin/new-creator-account", {
      title: "Create Creator Account",
      error: "An account with this email already exists."
    });
  }

  const user = await User.createAccount({ name: name, email: email, password: password, role: "creator" });
  if(user === null) {
    throw new Error("Error creating creator account");
  }
  await CreatorProfile.create({
    userId: user._id,
    displayName: name,
    brandName
  });

  res.redirect("/admin/creators");
}

async function postEditCreator(req, res) {
  const { name, email, status } = req.body;
  const creator = await User.findById(req.params.id);

  creator.name = name;
  creator.email = email;
  creator.status = status;
  await creator.save();
  getEditCreatorsView(req, res);
  // res.redirect(req.originalUrl);
}

async function getDeleteCreator(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const creatorId = req.params.id;

    // 1. Delete the user
    const user = await User.findByIdAndDelete(creatorId).session(session);
    
    if (!user) {
      throw new Error("Creator not found");
    }

    // 2. Delete the associated profile
    await CreatorProfile.findOneAndDelete({ userId: creatorId }).session(session);

    // Commit the transaction
    await session.commitTransaction();
    console.log(`Successfully deleted creator: ${creatorId}`);

    res.redirect("/admin/creators");
  } catch (error) {
    // Abort transaction on error
    await session.abortTransaction();
    console.error("Deletion failed:", error);
    res.status(500).send("Error deleting creator.");
  } finally {
    session.endSession();
  }
}

//---------------------------
//---------------------------
//---------------------------
module.exports = {
  getDashboardView,
  getCreatorsView,
  getNewCreatorView,
  getEditCreatorsView,
  postEditCreator,
  postNewCreator,
  getDeleteCreator
};
