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

## Project Documentation

Detailed planning documents are in the `docs/` folder:

- [Project Plan](docs/project-plan.md)
- [Directory Structure](docs/directory-structure.md)
- [API Plan](docs/api-plan.md)
- [Database Schema](docs/database-schema.md)
- [Content Strategy](docs/content-strategy.md)
- [Media and Storage](docs/media-and-storage.md)
- [Authentication and Roles](docs/auth-and-roles.md)
- [Deployment Plan](docs/deployment-plan.md)

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

## Current Status

Planning and early build stage. The project direction now includes MongoDB connection and media upload support. The next step is to update the working application so creators can upload media and consumers can view the latest 10 published posts from a creator.
