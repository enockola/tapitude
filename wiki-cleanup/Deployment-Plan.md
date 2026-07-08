# Deployment Plan

This page documents deployment considerations for Tapitude Creator Hub.

## Current Deployment Status

The app is structured as a Node.js/Express application with MongoDB. It uses local filesystem uploads during development.

Before production deployment, the team should verify the setup scripts, environment variables, storage plan, and security settings.

## Required Environment Variables

The app currently expects environment variables such as:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
SESSION_SECRET=replace_with_secure_secret
CSRF_SECRET=replace_with_secure_secret
```

`.env.example` should include every required variable. At minimum, add `CSRF_SECRET` because `src/middleware/security.ts` requires it.

## Startup Script Note

The repository currently contains:

```txt
src/server.ts
```

Check `package.json` before deployment. If scripts still point to `src/server.js`, update them to `src/server.ts`.

Recommended scripts:

```json
"dev": "npx tsx --watch src/server.ts",
"start": "npx tsx src/server.ts"
```

## Database

Production should use MongoDB with credentials stored outside the repository.

Before deployment:

- Confirm `MONGODB_URI` is set.
- Confirm the database user has only the permissions needed.
- Confirm indexes exist for common lookups.
- Confirm session storage works with `connect-mongo`.
- Confirm backup/restore expectations with sponsors.

## Sessions and Cookies

The app uses:

- `express-session`
- `connect-mongo`
- Cookie name `tapitude.sid`

Production settings should include:

- `NODE_ENV=production`
- Secure session secret.
- HTTPS.
- Secure cookies.
- Correct proxy settings if running behind a proxy.

## CSRF Protection

The app uses a session-bound CSRF token.

Before deployment:

- Set `CSRF_SECRET`.
- Confirm every POST form includes `_csrf`.
- Confirm Socket.IO and upload flows still work with CSRF rules.

## Media Storage

Current behavior:

- Uploaded files are stored in local `storage/`.
- The server exposes uploaded files at `/storage`.
- File metadata is stored in MongoDB.

This is acceptable for local development and controlled demos.

For production, use durable object storage such as:

- AWS S3
- Cloudflare R2
- Azure Blob Storage
- Google Cloud Storage
- Sponsor-approved storage

The existing `FileService` should be the abstraction point for future storage changes.

## Logging

The app uses Pino.

Production logging writes to console and `logs/app.log`.

Recommended follow-up:

- Confirm logs are retained by the hosting platform.
- Avoid logging sensitive secrets.
- Fix the startup log interpolation if needed:

```ts
logger.info(`Server started on port ${process.env.PORT}`);
```

## Production Checklist

Before production/demo handoff:

- `npm install` completes successfully.
- `npm run dev` works from a clean clone.
- `npm start` works from a clean clone.
- `.env.example` contains all required environment variables.
- MongoDB connection succeeds.
- Admin account can be created.
- Login/logout works.
- CSRF works on all forms.
- Creator account creation works.
- Creator profile update works.
- Post create/edit/delete works.
- Media upload/delete works.
- Public content hub loads published content.
- Disabled creator hubs are hidden.
- Oldest-post deletion works at the 25-post limit.
- No uploaded user files are committed to Git.

## Known Production Risks

- Local file storage can be lost on redeploy depending on hosting provider.
- Socket.IO content hub room behavior should be reviewed before multi-user production use.
- Account deletion cleanup should be verified so posts/media are not orphaned.
- TypeScript checks should be made reliable before long-term maintenance.

