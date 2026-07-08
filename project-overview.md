# Tapitude Project Overview

This document gives a high-level overview of how the Tapitude Creator Hub codebase is organized and how the main pieces work together. It is intended for sponsors, maintainers, and future developers who need to understand the project without reading every file first.

## What the Application Does

Tapitude is an Express/EJS web application for managing creator content that can be viewed by consumers through a public content hub, typically reached from a Tapitude NFC experience.

The application has three main audiences:

- **Admins** manage creator accounts.
- **Creators** manage their profile, branding, posts, media, and publishing schedule.
- **Viewers** visit a creator's public content hub and interact with published posts.

## Technology Stack

- **Runtime:** Node.js
- **Server framework:** Express
- **Views:** EJS templates
- **Database:** MongoDB through Mongoose
- **Sessions:** `express-session` with `connect-mongo`
- **Authentication:** Session-based login
- **Security:** Helmet, role checks, request user attachment, and CSRF protection
- **Uploads:** Local filesystem storage through `FileService`
- **Realtime viewer feed:** Socket.IO
- **Logging:** Pino

## Repository Structure

```txt
src/
  server.ts                     Main Express server setup
  controllers/                  Request handlers for each major area
  routes/                       Express route registration
  models/                       Mongoose schemas and file storage service
  middleware/                   Auth, role, CSRF, request attachment, error handling
  utils/                        Database, logging, timezone, async helpers
  types/                        Express/session TypeScript declarations

views/
  admin/                        Admin dashboard and creator account pages
  creator/                      Creator dashboard, content editor, profile, content list
  content_hub/                  Public creator content hub shell
  errors/                       403, 404, and 500 pages
  partials/                     Shared page chrome: head, sidebar, topbar, scripts

public/
  css/                          Stylesheets for dashboard, content hub, forms, components
  js/                           Browser-side scripts for editor, hub, auth, dashboard
  assets/                       Logo and static images
  bootstrap/                    Bundled Bootstrap assets

storage/                        Runtime upload storage, served at /storage
```

## Application Entry Point

The main server file is:

```txt
src/server.ts
```

It is responsible for:

- Validating required environment variables.
- Connecting to MongoDB.
- Creating the Express app and HTTP server.
- Registering EJS as the view engine.
- Serving static files from `public/`.
- Serving uploaded files from `storage/`.
- Setting up sessions backed by MongoDB.
- Attaching the logged-in user to each request.
- Registering CSRF protection.
- Mounting the route groups.
- Starting Socket.IO for the content hub.
- Registering 404 and 500 error handlers.

## Routing Layer

Routes are grouped by feature area in `src/routes/`.

| Route Prefix | Route File | Purpose |
| --- | --- | --- |
| `/` | `index.routes.js` | Home/about style public pages |
| `/auth` | `auth.routes.js` | Login and logout |
| `/admin` | `admin.routes.js` | Admin-only creator account management |
| `/creator` | `creator.routes.js` | Creator dashboard, posts, media, profile |
| `/content-hub` | `viewer_content_hub.routes.js` | Public creator content hub |

The route files stay intentionally small. Their main job is to create an Express router, apply middleware, and delegate actual behavior to a controller.

## Controllers

Controllers contain most of the application behavior.

### `auth.controller.ts`

Handles login and logout.

- Looks up users by email.
- Checks account status.
- Verifies passwords with bcrypt.
- Stores the logged-in user's id in the session.
- Redirects admins to the admin dashboard and creators to the creator dashboard.

### `admin.controller.ts`

Handles admin workflows.

- Shows admin dashboard counts.
- Lists creator accounts.
- Creates new creator accounts.
- Edits creator account information.
- Deletes creator accounts and associated creator profiles.

### `creator.controller.ts`

Handles the creator dashboard and content management workflows.

Major responsibilities include:

- Dashboard metrics.
- Listing creator posts.
- Editing creator profiles and branding.
- Creating a new post shell.
- Editing post body, publish time, and display options.
- Uploading or deleting media.
- Deleting posts and associated media.
- Enforcing the creator post limit.

Creators currently have a maximum post count. When a creator exceeds the limit, the oldest content page is deleted so the newest one can be created.

### `viewer_content_hub.controller.ts`

Handles the public content hub.

- Looks up creator profiles by creator slug.
- Ensures the creator account is active.
- Renders the public content hub page.
- Uses Socket.IO to send published content to viewers.
- Handles likes and view tracking.

## Models and Data

Models live in `src/models/` and define the database shape.

### `User.ts`

Represents a login account.

Important fields:

- `name`
- `email`
- `passwordHash`
- `role`: `admin` or `creator`
- `status`: `active` or `disabled`

The model also includes helper methods for creating accounts, comparing passwords, enabling/disabling accounts, and changing passwords.

### `CreatorProfile.ts`

Represents public and editable creator profile information.

Important fields:

- `userId`
- `creatorSlug`
- `displayName`
- `brandName`
- `brandColor`
- `bio`
- `profileImageKey`
- `totalViews`
- `totalLikes`

The `creatorSlug` is generated from the creator's user id when a profile is saved.

### `ContentPage.ts`

Represents an individual creator post.

Important fields:

- `creatorId`
- `fileKey`
- `body`
- `publishDate`
- `likes`
- `viewedBy`
- `preserveAspectRatio`

Content is considered published when `publishDate` is in the past and scheduled when `publishDate` is in the future.

### `FileService.ts`

Handles uploaded file storage.

It writes files to the local `storage/` directory and records metadata in MongoDB. Content pages and creator profiles store file references using a `fileKey`.

Important operations:

- Upload a file.
- Read file bytes.
- Read file metadata.
- Update file metadata.
- Delete a file and its metadata.

## Middleware

Middleware lives in `src/middleware/`.

### Request User Attachment

`reqAttachments.ts` checks the session for a `userId`, loads the user, and attaches it to:

- `req.user`
- `res.locals.currentUser`

This makes user information available to controllers and EJS templates.

### Authentication and Role Checks

`requireAuth.ts` and `security.ts` provide authentication and role protection.

The main role checks are:

- `adminCheck`
- `creatorCheck`

These protect admin and creator areas from unauthorized access.

### CSRF Protection

`security.ts` also provides CSRF protection.

The app creates a session-bound token, stores it in a cookie, exposes it to EJS forms through `res.locals._csrf`, and checks submitted tokens on non-GET requests.

### Error Pages

`errorPages.js` provides:

- `notFound` for 404 pages.
- `errorHandler` for 500 pages.

These are mounted last in `server.ts`.

## Views and Frontend Assets

The app uses EJS templates in `views/`.

The main page groups are:

- `views/admin/` for admin pages.
- `views/creator/` for creator dashboard, content editor, content list, and profile.
- `views/content_hub/` for the public viewer experience.
- `views/partials/` for shared layout pieces.

Browser-side JavaScript lives in `public/js/`.

Important files include:

- `content-editor.js` for editor-side upload/editor interactions.
- `content-hub.js` for the viewer feed and Socket.IO client.
- `main.js` for shared browser utilities.

CSS lives in `public/css/`, split into layout and component styles.

## Main Workflows

### Login Flow

1. User visits `/auth/login`.
2. Login form posts email and password.
3. `AuthController` validates credentials.
4. User id is stored in the session.
5. Admins are redirected to `/admin/dashboard`.
6. Creators are redirected to `/creator/dashboard`.

### Admin Creates a Creator

1. Admin opens `/admin/creators/new`.
2. Admin submits creator name, email, password, and brand name.
3. `AdminController` creates a `User` account.
4. A matching `CreatorProfile` is created.
5. Admin is redirected back to the creators list.

### Creator Creates or Edits Content

1. Creator opens the content editor.
2. Creator writes text and selects publish timing.
3. Form submits to the creator controller.
4. Controller updates the `ContentPage`.
5. On edit, the user returns to the editor with a saved confirmation.
6. Media can be uploaded separately through the media upload form.

### Creator Uploads Media

1. Creator selects a file in the editor.
2. The browser submits the media form.
3. `CreatorController` streams the file with Busboy.
4. `FileService` saves the file to `storage/` and writes metadata to MongoDB.
5. The `ContentPage` stores the returned `fileKey`.
6. Old media is deleted when replaced.

### Viewer Opens Content Hub

1. Viewer opens `/content-hub/:slug`.
2. The controller finds the matching creator profile.
3. The viewer page connects to the `/content-hub` Socket.IO namespace.
4. Browser requests content through the socket.
5. Server sends published content pages.
6. Likes and views are tracked through socket events.

## Environment Configuration

The app expects environment variables, usually from `.env`.

Important values include:

- `PORT`
- `NODE_ENV`
- `MONGODB_URI`
- `SESSION_SECRET`
- `CSRF_SECRET`
- Seed admin values for creating an initial admin account.

The example file is:

```txt
.env.example
```

## Development Commands

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run the production-style start command:

```bash
npm start
```

Create a seeded admin account:

```bash
npm run new_admin_account
```

## How the Pieces Fit Together

At a high level:

1. `server.ts` creates the app, connects infrastructure, and mounts route groups.
2. Route files decide which controller handles each URL.
3. Controllers enforce workflow rules and call models/services.
4. Models define MongoDB data shapes.
5. `FileService` handles physical uploaded files and file metadata.
6. Middleware attaches users, protects routes, checks CSRF tokens, and handles errors.
7. EJS views render server-side HTML for admins, creators, and viewers.
8. Browser JavaScript adds interactivity such as media upload and Socket.IO content loading.

This structure keeps the app organized by responsibility: routes direct traffic, controllers handle decisions, models store data, services handle specialized work, middleware protects requests, and views present the result.

