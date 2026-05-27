# Tapitude Creator Hub

Tapitude Creator Hub is a web dashboard for content creators to create, manage, customize, and publish content pages. Consumers will eventually access those pages through URLs connected to Tapitude NFC chips.

## Tech Stack

- Node.js
- Express.js
- JavaScript
- EJS views for server-rendered HTML
- CSS and client-side JavaScript
- MongoDB

## Main User Types

- **Admin:** Creates and manages creator accounts.
- **Creator:** Creates, edits, schedules, publishes, and customizes content pages.
- **Consumer:** Views public content pages. Consumers do not need accounts.

## MVP Features

- Admin login
- Admin creates creator accounts
- Creator login
- Creator dashboard
- Creator creates and edits content pages
- Creator can schedule posts
- Creator can publish posts right away
- Public content page by slug
- Basic theme/personalization options

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

## Suggested Project Structure

```txt
tapitude-creator-hub/
├── README.md
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
├── uploads/
└── tests/
```

## Current Status

Planning stage. No HTML files need to be created yet. The next step is to finalize the MVP scope, database schema, API plan, and directory structure before coding.
