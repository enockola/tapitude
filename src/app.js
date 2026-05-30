require("dotenv").config();

const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const methodOverride = require("method-override");
const helmet = require("helmet");
const morgan = require("morgan");

const pageRoutes = require("./routes/page.routes");
const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const creatorRoutes = require("./routes/creator.routes");
const contentRoutes = require("./routes/content.routes");
const publicRoutes = require("./routes/public.routes");

const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");
const attachUser = require("./middleware/attachUser");

const app = express();
const useMockData = process.env.USE_MOCK_DATA === "true";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

app.use(helmet({
  contentSecurityPolicy: false
}));

//Use Morgan, a logging middleware for HTTP requests
//Morgan logs the client request and the servers response to said request
app.use(morgan('dev', {
  skip: function (req, res) { 
    return req.url.includes('/css/') || 
           req.url.includes('/js/') || 
           req.url.includes('/images/'); 
  }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "..", "public")));

const sessionOptions = {
  name: "tapitude.sid",
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 24
  }
};

if (!useMockData && process.env.MONGODB_URI) {
  sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
}

app.use(session(sessionOptions));

app.use(attachUser);

app.use("/", pageRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/creator", creatorRoutes);
app.use("/content-pages", contentRoutes);
app.use("/p", publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
