# Project Plan

This page defines the current Tapitude Creator Hub scope, priorities, and boundaries.

## Project Summary

Tapitude Creator Hub is a dashboard where approved content creators manage posts that appear on a public Tapitude content hub. Public viewers access a creator's hub through a URL, often connected to a Tapitude NFC experience.

The NFC hardware/chip implementation is not the focus of this codebase. This project focuses on the creator/admin web platform and the public content viewing experience.

## Current Scope

### Admin Features

- Admin login.
- Admin dashboard.
- Manual creator account creation.
- Creator account list.
- Creator account editing.
- Creator account disabling/deletion.

### Creator Features

- Creator login.
- Creator dashboard.
- Creator profile and branding management.
- Post creation.
- Post editing.
- Media upload and deletion.
- Publish/schedule timing through `publishDate`.
- Post limit warning and enforcement.
- Basic analytics display.

### Public Viewer Features

- Public creator content hub.
- Published post loading through Socket.IO.
- Likes.
- View tracking.
- Creator account status check before showing hub.

### Data and Infrastructure

- MongoDB persistence.
- Mongoose models.
- Session-based authentication.
- CSRF protection.
- Local file storage for development.
- Pino logging.
- Project documentation.

## Out of Scope

The following are not current implementation goals:

- Public creator signup.
- Creator application/approval forms.
- Public viewer accounts.
- Public comments.
- Ecommerce/shopping flows.
- Wristband/chip purchasing flow.
- Advanced analytics dashboards.
- Advanced media processing/transcoding.
- Multiple media files per post.
- Public post detail pages.
- Full REST API documentation.

## Current Product Rules

- Admins manually create creator accounts.
- Creators manage their own profile and posts.
- Public viewers do not log in.
- A creator's public hub is available at `/content-hub/:creatorSlug`.
- Disabled creator accounts should not expose a public hub.
- Creators can upload one media file per post.
- Creators can have up to 25 content pages.
- When creating beyond the post limit, the oldest post should be deleted with its media.
- Scheduled/published behavior should be based on publish timing.

## Known Implementation Items to Resolve

Before final handoff, resolve:

- `package.json` startup scripts should point to the actual server file.
- `.env.example` should include all required environment variables, including `CSRF_SECRET`.
- The content hub Socket.IO response should not be broadcast to unrelated viewers.
- `ContentPage.status` usage should be reconciled with the current schema.
- Media upload/update paths should consistently enforce creator ownership.
- Admin creator deletion should be reviewed for content/media cleanup.
- Automated tests should be added for core workflows.

## Recommended Next Priorities

1. Fix setup/config mismatches.
2. Reconcile content publish status rules.
3. Fix content hub Socket.IO room/emit behavior.
4. Add ownership checks to all post/media mutations.
5. Add tests for login, create, edit, upload, delete, and content hub visibility.
6. Review production storage needs.
7. Add deployment documentation and final QA checklist.

