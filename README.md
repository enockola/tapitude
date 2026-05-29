# Tapitude Creator Hub

Tapitude Creator Hub is a web dashboard for content creators to create, manage, customize, schedule, and publish content posts. Consumers will access a creator's public content experience through URLs connected to Tapitude NFC chips.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- EJS views for server-rendered pages
- CSS and client-side JavaScript
- MongoDB
- Media upload support

## Main User Types

- **Admin:** Creates and manages creator accounts.
- **Creator:** Creates, edits, schedules, publishes, and customizes content posts.
- **Consumer:** Views a creator's public content experience. Consumers do not need accounts.

## Updated Content Direction

Creators can upload media as part of their content posts. This can include images, videos, or document-style media depending on the final MVP upload limits.

Consumers should be able to view the creator's latest content history. For the MVP, the public consumer view should show the **latest 10 published posts** from a creator.

## MVP Features

- Admin login
- Admin creates creator accounts
- Creator login
- Creator dashboard
- Creator creates and edits content posts
- Creator can upload media for posts
- Creator can schedule posts
- Creator can publish posts right away
- Public creator page showing the latest 10 published posts
- Individual public post page by slug
- Basic theme/personalization options
- MongoDB stores users, creator profiles, content posts, media metadata, and theme settings


## Setup

1. [Install npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)

2. Install dependencies:
```bash
npm install
npm install dotenv
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

## MVP Features

- Admin login
- Admin creates creator accounts
- Creator login
- Creator dashboard
- Creator creates and edits content posts
- Creator can upload media for posts
- Creator can schedule posts
- Creator can publish posts right away
- Public creator page showing the latest 10 published posts
- Individual public post page by slug
- Basic theme/personalization options
- MongoDB stores users, creator profiles, content posts, media metadata, and theme settings

## Project Documentation

Detailed planning documents are in the wiki

## Suggested Project Structure

```txt
tapitude-creator-hub/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── docs/
├── src/
├── views/
├── public/
│   ├── css/
│   ├── js/
│   └── assets/
├── uploads/
└── tests/
```

## Important Note

This version is not meant to be production-ready. It is for frontend work while the MongoDB connection is unavailable.

When MongoDB is ready, set:

```env
USE_MOCK_DATA=false
MONGODB_URI=your_mongodb_connection_string
```

Then reconnect the real database controllers and models.

## Current Status

Planning and early build stage. The project direction now includes MongoDB connection and media upload support. The next step is to update the working application so creators can upload media and consumers can view the latest 10 published posts from a creator.


## Next Build Steps

1. Finish authentication flow.
2. Build admin creator-account management.
3. Build creator content CRUD.
4. Add publish/schedule logic.
5. Render public content pages by slug.
6. Improve dashboard styling based on Figma feedback.
# Tapitude Creator Hub

Tapitude Creator Hub is a web dashboard for content creators to create, manage, customize, schedule, and publish content posts. Consumers will access a creator's public content experience through URLs connected to Tapitude NFC chips.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- EJS views for server-rendered pages
- CSS and client-side JavaScript
- MongoDB
- Media upload support

## Main User Types

- **Admin:** Creates and manages creator accounts.
- **Creator:** Creates, edits, schedules, publishes, and customizes content posts.
- **Consumer:** Views a creator's public content experience. Consumers do not need accounts.

## Updated Content Direction

Creators can upload media as part of their content posts. This can include images, videos, or document-style media depending on the final MVP upload limits.

Consumers should be able to view the creator's latest content history. For the MVP, the public consumer view should show the **latest 10 published posts** from a creator.

## MVP Features

- Admin login
- Admin creates creator accounts
- Creator login
- Creator dashboard
- Creator creates and edits content posts
- Creator can upload media for posts
- Creator can schedule posts
- Creator can publish posts right away
- Public creator page showing the latest 10 published posts
- Individual public post page by slug
- Basic theme/personalization options
- MongoDB stores users, creator profiles, content posts, media metadata, and theme settings


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

Detailed planning documents are in the wiki

## Suggested Project Structure

```txt
tapitude-creator-hub/
├── README.md
├── package.json
├── .env.example
├── .gitignore
├── docs/
├── src/
├── views/
├── public/
│   ├── css/
│   ├── js/
│   └── assets/
├── uploads/
└── tests/
```

## Important Note

This version is not meant to be production-ready. It is for frontend work while the MongoDB connection is unavailable.

When MongoDB is ready, set:

```env
USE_MOCK_DATA=false
MONGODB_URI=your_mongodb_connection_string
```

Then reconnect the real database controllers and models.

## Current Status

Planning and early build stage. The project direction now includes MongoDB connection and media upload support. The next step is to update the working application so creators can upload media and consumers can view the latest 10 published posts from a creator.


## Next Build Steps

1. Finish authentication flow.
2. Build admin creator-account management.
3. Build creator content CRUD.
4. Add publish/schedule logic.
5. Render public content pages by slug.
6. Improve dashboard styling based on Figma feedback.
