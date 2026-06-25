import "dotenv/config";

import path from "path";
import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import methodOverride from "method-override";
import helmet from "helmet";
import morgan from "morgan";
import connectDB from "./utils/db.js";
import { startContentScheduler } from "./services/contentScheduler.service";
import {
  formatEtDateTime,
  toEtDateTimeInputValue,
  SCHEDULE_TIME_ZONE,
  SCHEDULE_TIME_ZONE_LABEL
} from "./utils/timezoneUtils.js";

import notFound from "./middleware/notFound.js";
import errorHandler from "./middleware/errorHandler.js";
import attachUser from "./middleware/attachUser.js";

// routes
import indexRoutes from "./routes/index.routes.js";
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import creatorRoutes from "./routes/creator.routes.js";
import publicRoutes from "./routes/public.routes.js";
import viewerContentHubRoutes from "./routes/viewer_content_hub.routes.js";

import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer); //websocket
const useMockData = process.env.USE_MOCK_DATA === "true";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

//App globals for use by views
app.locals.formatEtDateTime = formatEtDateTime;
app.locals.toEtDateTimeInputValue = toEtDateTimeInputValue;
app.locals.scheduleTimeZoneLabel = SCHEDULE_TIME_ZONE_LABEL;
app.locals.scheduleTimeZone = SCHEDULE_TIME_ZONE;

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


//Serve local directories to static files
app.use(express.static(path.join(__dirname, "..", "public")));

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//for uploaded files (TODO: Change this to a CDN when storage gets switched to an S3 bucket)
app.use("/storage", express.static(path.join(__dirname, '..', 'storage')));
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

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

if (process.env.MONGODB_URI) {
  sessionOptions.store = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
}

app.use(session(sessionOptions));

app.use(attachUser);

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

app.use(notFound);

app.use(errorHandler);

//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------

// // Handle new connections
// io.on('connection', (socket) => {
//   console.log('A user connected:', socket.id);

//   socket.on('disconnect', () => {
//     console.log('User disconnected:', socket.id);
//   });
// });

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  if (process.env.MONGODB_URI) {
    startContentScheduler();
  }

  httpServer.listen(PORT, () => {
    console.log(`Tapitude Creator Hub running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

