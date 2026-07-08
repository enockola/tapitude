# Tapitude Wiki

This wiki documents the Tapitude Creator Hub project at a high level. It is intended for sponsors, future maintainers, and developers who need to understand the app without reading the entire codebase first.

## Project Summary

Tapitude Creator Hub is a web application where approved creators can manage content that appears on a public Tapitude content hub. Viewers reach a creator's hub through a public URL, often connected to a Tapitude NFC experience.

The project has three main audiences:

- **Admins** create and manage creator accounts.
- **Creators** manage their profile, brand information, posts, scheduling, and uploaded media.
- **Viewers** visit a creator's public content hub and interact with published posts.

## Current Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Views:** EJS templates
- **Database:** MongoDB with Mongoose
- **Authentication:** Session-based login
- **Sessions:** `express-session` with `connect-mongo`
- **Security:** Helmet, role checks, request user attachment, CSRF protection
- **Media uploads:** Local filesystem storage through `FileService`
- **Realtime public feed:** Socket.IO
- **Logging:** Pino

## Wiki Pages

| Page | Purpose |
| --- | --- |
| [Project Plan](Project-Plan) | Project scope, roles, priorities, and boundaries |
| [Authentication and Roles](Authentication-and-Roles) | User types, access rules, login behavior, route protection |
| [Creator Dashboard](Creator-Dashboard) | Creator-facing dashboard, profile, post, media, and content management behavior |
| [Content Hub](Content-hub) | Public viewer experience and Socket.IO content loading |
| [Database - Data Model](Database-%E2%80%90-Data-Model) | High-level relationship diagram |
| [Database - Schema](Database-%E2%80%90-Schema) | Current MongoDB models and important fields |
| [Media and Storage](Media-and-Storage) | Upload behavior, local storage, metadata, deletion rules |
| [Routes](Routes) | Current route map |
| [Directory Structure](Directory-Structure) | How the codebase is organized |
| [Deployment Plan](Deployment-Plan) | Environment variables, setup notes, and deployment checklist |

## Documentation Rules

- Keep each page focused on one topic.
- Avoid repeating long explanations across pages.
- Prefer documenting what the current project actually does.
- If a feature is planned but not implemented, label it clearly as a future improvement.
- Remove or update starter-template content when it no longer matches the code.

## Known High-Priority Cleanup Items

These are important enough to keep visible:

- `package.json` scripts currently reference `src/server.js`, while the current server file is `src/server.ts`.
- `.env.example` should include `CSRF_SECRET` because the app requires it at startup.
- The content hub Socket.IO room behavior should be reviewed so responses are not broadcast to unrelated viewers.
- The `ContentPage` schema and controller/view usage should be reconciled around `status` and `publishDate`.

