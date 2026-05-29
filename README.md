# Tapitude Creator Hub Starter

This is a starter Express/EJS project for the Tapitude Creator Hub.

## Tech Stack

- Node.js
- Express
- EJS
- MongoDB/Mongoose
- HTML, CSS, and client-side JavaScript

## Important Project Direction

Tapitude does **not** store creator-uploaded media files in this starter version.

Creators create public content pages with:

- Text
- External links
- Embed URLs
- Theme settings
- Publish/schedule status
- Public slugs

## Setup

1. [Install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Install dependencies:
```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

3. Make sure your `.env` has:

```env
USE_MOCK_DATA=true
MONGODB_URI=
```

4. Start the app:

```bash
npm run dev
```

5. Open:

```txt
http://localhost:3000
```

## Mock Login

Because this is frontend/mock mode, login accepts these demo accounts:

```txt
admin@tapitude.test
creator@tapitude.test
```

## How the Project Works Right Now

This version of Tapitude Creator Hub is currently running in **frontend/mock mode**.

That means the app uses Express and EJS to render real pages, but it does **not** connect to MongoDB yet. Instead, it uses sample data from a local mock data file so the team can work on the frontend, dashboard layout, routes, forms, and page flow before the real database is available.

## Why We Are Using Mock Mode

We do not currently have access to the MongoDB database yet, so connecting the app to MongoDB would cause the server to crash.

To avoid that, the app checks this value in `.env`:

```env
USE_MOCK_DATA=true
```
Any password will work in mock mode.

## Helpful Routes

```txt
/
 /auth/login
/admin/dashboard
/admin/creators
/admin/creators/new
/creator/dashboard
/creator/content
/content-pages/new
/p/summer-drop-2026
```

## Current Starter Features

- EJS view setup
- Static CSS/JS setup
- Session authentication setup
- Admin and creator roles
- Basic admin dashboard
- Basic creator dashboard
- Content page model
- Theme model
- Public page route by slug
- Simple layered CSS structure


## Project Documentation

Detailed planning documents are in the `docs/` folder:

- [Project Plan](docs/project-plan.md)
- [Directory Structure](docs/directory-structure.md)
- [Express Views and Static Assets](docs/express-views.md)
- [API Plan](docs/api-plan.md)
- [Database Schema](docs/database-schema.md)
- [Content Strategy](docs/content-strategy.md)
- [Authentication and Roles](docs/auth-and-roles.md)
- [Deployment Plan](docs/deployment-plan.md)

## Folder Structure

```txt
tapitude/
├── docs/
├── src/
├── views/
│   ├── errors/
│   ├── forms/
│   ├── partials/
│   ├── admin/
│   ├── creator/
│   └── public/
├── public/
│   ├── css/
│   ├── js/
│   └── assets/
└── README.md
```

## Important Note

This version is not meant to be production-ready. It is for frontend work while the MongoDB connection is unavailable.

When MongoDB is ready, set:

```env
USE_MOCK_DATA=false
MONGODB_URI=your_mongodb_connection_string
```

Then reconnect the real database controllers and models.


## Next Build Steps

1. Finish authentication flow.
2. Build admin creator-account management.
3. Build creator content CRUD.
4. Add publish/schedule logic.
5. Render public content pages by slug.
6. Improve dashboard styling based on Figma feedback.
