import "dotenv/config";

import path from "path";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import methodOverride from "method-override";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./utils/db.js";
import {
  formatEtDateTime,
  toEtDateTimeInputValue,
  SCHEDULE_TIME_ZONE,
  SCHEDULE_TIME_ZONE_LABEL
} from "./utils/timezoneUtils.js";

import {errorHandler, notFound} from "./middleware/errorPages.js";
import reqAttachments from "./middleware/reqAttachments.ts";

// routes
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import creatorRoutes from "./routes/creator.routes.js";
import publicRoutes from "./routes/public.routes.js";
import viewerContentHubRoutes from "./routes/viewer_content_hub.routes.js";

import { createServer } from 'http';
import { Server } from 'socket.io';

const cookieParser = require('cookie-parser');
import {generateCsrfToken} from './utils/securityUtils.js';


//----------------------------------------------------------------------------------------------
// Constants -----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

if(!process.env.SESSION_SECRET)
  throw new Error("SESSION_SECRET is not set");

if (!process.env.MONGODB_URI)
  throw new Error("MONGODB_URI is not set");

const isProduction = process.env.NODE_ENV === "production" ? true : false;
console.log(`Production Environment: ${isProduction}`);

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
app.use(reqAttachments); //load and attach the user to the request every time (get the user from session userId)

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

//Routes
app.use("/", indexRoutes);

app.use("/auth", authRoutes);

app.use("/admin", adminRoutes);

app.use("/creator", creatorRoutes);

app.use("/p", publicRoutes);

app.use("/content-hub", viewerContentHubRoutes);
const viewerNamespace = io.of('/content-hub'); //register websocket
viewerNamespace.on('connection', (socket) => {
  viewerContentHubRoutes.handleSocketConnection(viewerNamespace, socket);
});

//The client asske the server for a CSRF token, and the server responds with the token
app.get("/csrf-token", (req:any, res:any) => {
  const csrfToken = generateCsrfToken(req, res);
  // You could also pass the token into the context of a HTML response.
  res.json({ csrfToken });
});


//Error handlers (these come last)
app.use(notFound);
app.use(errorHandler);

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------


//Start the server
const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`Tapitude Creator Hub running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

