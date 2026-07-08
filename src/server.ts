import "dotenv/config";

//----------------------------------------------------------------------------------------------
// Constants -----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

if (!process.env.NODE_ENV || (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "production"))
  throw new Error("NODE_ENV is not set, Must be 'development' or 'production'");

// Import logging utils
import { logger } from './utils/loggingUtils.js';
const isProduction = process.env.NODE_ENV === "production" ? true : false;
logger.info(`Production Environment: ${isProduction}`);

// check for required environment variables
if (!process.env.SESSION_SECRET)
  throw new Error("SESSION_SECRET is not set");

if (!process.env.MONGODB_URI)
  throw new Error("MONGODB_URI is not set");

if (!process.env.PORT)
  throw new Error("PORT is not set");

//----------------------------------------------------------------------------------------------
// Imports -----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
import path from "path";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import methodOverride from "method-override";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./utils/dbUtils.js";
import {
  formatEtDateTime,
  toEtDateTimeInputValue,
  SCHEDULE_TIME_ZONE,
  SCHEDULE_TIME_ZONE_LABEL
} from "./utils/timezoneUtils.js";

import { errorHandler, notFound } from "./middleware/errorPages.js";
import reqAttachUser from "./middleware/reqAttachments.ts";

// routes
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import creatorRoutes from "./routes/creator.routes.js";
import viewerContentHubRoutes from "./routes/viewer_content_hub.routes.js";

import { createServer } from 'http';
import { Server } from 'socket.io';

const cookieParser = require('cookie-parser');
import { checkDoubleCsrf, attachCsrfToken } from './middleware/security.js';


//----------------------------------------------------------------------------------------------
// Server Setup -----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer); //websocket

app.set("view engine", "ejs");
app.set("trust proxy", 1);
app.set("views", path.join(__dirname, "..", "views"));

//App globals for use by views
app.locals.formatEtDateTime = formatEtDateTime;
app.locals.toEtDateTimeInputValue = toEtDateTimeInputValue;
app.locals.scheduleTimeZoneLabel = SCHEDULE_TIME_ZONE_LABEL;
app.locals.scheduleTimeZone = SCHEDULE_TIME_ZONE;

app.use(helmet({
  contentSecurityPolicy: false
}));



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));


//Serve local directories to static files
app.use(express.static(path.join(__dirname, "..", "public")));

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//for uploaded files (TODO: Change this to a CDN when storage gets switched to an S3 bucket)
app.use("/storage", express.static(path.join(__dirname, '..', 'storage')));


//----------------------------------------------------------------------------------------------
//Middleware -----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

//Use Morgan, a logging middleware for HTTP requests
//Morgan logs the client request and the servers response to said request
app.use(morgan('dev', {
  skip: function (req, res) {
    return req.url.includes('/css/') ||
      req.url.includes('/js/') ||
      req.url.includes('/images/');
  }
}));


app.use(session({ //Session ID cookie
  name: "tapitude.sid",
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 1000 * 60 * 60 * 24
  }
}));

app.use(cookieParser());
app.use(reqAttachUser); //load and attach the user to the request every time (get the user from session userId)

//Security middleware
app.use(checkDoubleCsrf);
app.use(attachCsrfToken);
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

//Routes
app.use("/", indexRoutes);
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/creator", creatorRoutes);
app.use("/content-hub", viewerContentHubRoutes);

const viewerNamespace = io.of('/content-hub'); //register websocket
viewerNamespace.on('connection', (socket) => {
  viewerContentHubRoutes.handleSocketConnection(viewerNamespace, socket);
});

//Error handlers (these come last)
app.use(notFound);
app.use(errorHandler);

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

async function startServer() {
  await connectDB();
  httpServer.listen(process.env.PORT, () => {
    logger.info("Server started on port "+process.env.PORT);
  });
}

startServer().catch((error) => {
  logger.error({ error }, "Failed to start server:");
  process.exit(1);
});

