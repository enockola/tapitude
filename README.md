# Tapitude Creator Hub

Tapitude Creator Hub is a web dashboard that allows approved content creators to manage posts that appear on their public Tapitude page. Public consumers access a creator's page through a URL connected to a Tapitude NFC chip.

This repository is currently in the MVP planning and early build stage.

## Current MVP Direction

- Tapitude admins manually create and manage creator accounts.
- Creators log in to create, upload, schedule, and manage posts.
- Public consumers do not need accounts.
- Each creator can have up to **25 active posts** visible on their public page.
- Each creator can have up to **25 scheduled posts** queued for future publishing.
- When a 26th active post is published, the oldest active post and its media are permanently deleted.
- Support is handled through email at `support@tapitude.com`, not through an in-app ticket system.

## Tech Stack

- Node.js
- Express.js
- EJS views
- JavaScript
- CSS
- MongoDB
- Local media uploads for development
- Cloud media storage planned for production

## Quick Start

Install dependencies:

```bash
npm install
```

Create an environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Recommended development values:

```env
USE_MOCK_DATA=true
MONGODB_URI=
SESSION_SECRET=replace-with-local-secret
```

Start the development server:

```bash
npm run dev
```

Open the app locally:

```txt
http://localhost:3000
```

## Mock Mode

During early development, the app may run in mock mode so the team can build page flow, forms, EJS views, and dashboard screens without requiring a live MongoDB connection.

```env
USE_MOCK_DATA=true
```

When MongoDB integration is ready, update the environment values:

```env
USE_MOCK_DATA=false
MONGODB_URI=your_mongodb_connection_string
```

## Documentation

The full project documentation is maintained in the Wiki/docs files.

| Document | Purpose |
| --- | --- |
| [Home](https://github.com/enockola/tapitude/wiki) | Wiki landing page and documentation map |
| [Project Plan](https://github.com/enockola/tapitude/wiki/Project-Plan) | MVP scope, priorities, out-of-scope items, and next steps |
| [Authentication and Roles](https://github.com/enockola/tapitude/wiki/Authentication-and-Roles) | Admin, creator, and public consumer permissions |
| [Content Strategy](https://github.com/enockola/tapitude/wiki/Content-Strategy) | Post lifecycle, 25 active posts, 25 scheduled posts, and public display rules |
| [Media and Storage](https://github.com/enockola/tapitude/wiki/Media-and-Storage) | Upload rules, storage plan, and media deletion behavior |
| [API Plan](https://github.com/enockola/tapitude/wiki/Api-Plan) | Route map for API and public routes |
| [Database Schema](https://github.com/enockola/tapitude/wiki/Database-Schema) | MongoDB collections, fields, indexes, and data rules |
| [Data Model Diagram](https://github.com/enockola/tapitude/wiki/Data-Model-Diagram) | Mermaid diagram of MongoDB collection relationships |
| [Express Views](https://github.com/enockola/tapitude/wiki/Express-Views) | EJS view structure and page responsibilities |
| [Directory Structure](https://github.com/enockola/tapitude/wiki/Directory-Structure) | Recommended project folders and responsibilities |
| [Deployment Plan](https://github.com/enockola/tapitude/wiki/Deployment-Plan) | Deployment, environment variables, storage, and production checklist |

## Documentation Update Rule

To keep documentation easy to maintain, update the source page first:

- Scope changes go in [Project Plan](https://github.com/enockola/tapitude/wiki/Project-Plan).
- Post limits and lifecycle rules go in [Content Strategy](https://github.com/enockola/tapitude/wiki/Content-Strategy).
- Media upload or deletion changes go in [Media and Storage](https://github.com/enockola/tapitude/wiki/Media-and-Storage).
- Route changes go in [API Plan](https://github.com/enockola/tapitude/wiki/Api-Plan).
- Data field or relationship changes go in [Database Schema](https://github.com/enockola/tapitude/wiki/Database-Schema).

The README should stay short and point to the Wiki/docs for details.
