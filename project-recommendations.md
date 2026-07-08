# Tapitude Project Recommendations

This document summarizes recommended next steps for stabilizing, testing, and improving the Tapitude Creator Hub. It focuses on items that would matter most to sponsors, future maintainers, and anyone taking the project forward after the semester.

## Summary

The project has a strong foundation: it has clear admin, creator, and viewer flows; a working Express/EJS structure; MongoDB models; session-based authentication; file uploads; and a public content hub powered by Socket.IO.

The main recommendations are:

- Add automated tests around high-risk workflows.
- Fix configuration mismatches that may block setup.
- Harden creator ownership checks and public content socket behavior.
- Refactor repeated controller logic into services.
- Clarify media cleanup and account deletion behavior.
- Improve documentation around deployment and environment variables.

## Highest Priority Items

### 1. Fix Startup and Environment Configuration

The current `package.json` scripts point to `src/server.js`, but the server file in the repository is `src/server.ts`.

Current scripts:

```json
"dev": "npx tsx --watch src/server.js",
"start": "npx tsx src/server.js"
```

Recommended change:

```json
"dev": "npx tsx --watch src/server.ts",
"start": "npx tsx src/server.ts"
```

Also, `src/middleware/security.ts` requires `CSRF_SECRET`, but `.env.example` does not currently include it. This can cause a fresh install to fail at startup.

Recommended `.env.example` addition:

```env
CSRF_SECRET=replace_this_with_a_long_random_secret
```

There is also a small logging issue in `src/server.ts`:

```ts
logger.info('Server started on port ${process.env.PORT}');
```

Because this uses single quotes instead of backticks, it logs the literal text instead of the actual port.

Recommended change:

```ts
logger.info(`Server started on port ${process.env.PORT}`);
```

### 2. Add Automated Tests for Core Workflows

The app currently relies heavily on manual testing. Before handoff or sponsor review, the project would benefit from tests for the most important user flows.

Recommended tests:

- Admin can create a creator account.
- Creator can log in.
- Creator can create a new post.
- Creator can edit a post and see the saved confirmation.
- Creator can upload media to a post.
- Creator can delete media from a post.
- Creator can delete a post and its media.
- Creator post limit deletes the oldest post when a new post exceeds the limit.
- Public content hub only shows posts whose `publishDate` is due.
- Disabled creator accounts cannot show public content.

Good test tooling options:

- **Jest or Vitest** for unit tests.
- **Supertest** for Express route tests.
- **Playwright** for full browser workflow tests.

### 3. Fix Socket.IO Content Hub Broadcast Behavior

The content hub currently joins all viewers into the same room:

```ts
socket.join('viewer_hub');
const client = io.to('viewer_hub');
```

When one viewer requests content, the server emits the response to the whole `viewer_hub` room. That means one user's requested post could be broadcast to other connected viewers.

Recommended behavior:

- Use `socket.emit(...)` for responses to one viewer.
- Or create separate rooms per creator, such as `viewer_hub:${creatorId}`.

This is important for correctness and privacy, especially if multiple creator hubs are being viewed at the same time.

### 4. Tighten Ownership Checks on Media Uploads

Some post update paths correctly include both the post id and `creatorId`. Media upload still uses `findByIdAndUpdate(fields.postID, ...)`, which does not check that the post belongs to the logged-in creator.

Recommended change:

- Replace `findByIdAndUpdate(fields.postID, ...)` with a creator-scoped query:

```ts
ContentPage.findOneAndUpdate(
  { _id: fields.postID, creatorId: req.user._id },
  update,
  { new: true }
)
```

This prevents a creator from modifying media on a post they do not own if they somehow know the post id.

### 5. Review Account Deletion Cleanup

Admin creator deletion currently removes the user and creator profile, but it should be reviewed for related data cleanup.

Recommended checks:

- Delete the creator's content pages.
- Delete content media files.
- Delete profile image files.
- Delete file metadata records.
- Confirm analytics behavior after deletion.

This is especially important because file uploads are stored on disk and can become orphaned if the corresponding user/content records are removed.

## Medium Priority Items

### 6. Refactor Business Logic into Services

Some controllers are carrying a lot of business logic. For example, `creator.controller.ts` currently handles routing behavior, post limit enforcement, media deletion, profile updates, and upload processing.

Recommended service split:

- `ContentPageService`
  - Create post shell.
  - Edit post.
  - Delete post with media.
  - Enforce post limit.

- `CreatorProfileService`
  - Update profile.
  - Replace profile image.
  - Clean up old profile images.

- `AnalyticsService`
  - Track views.
  - Track likes.
  - Prevent double counting.

This would make the project easier to test and maintain.

### 7. Improve Like and View Tracking

The current content hub increments likes and profile totals through socket events. Recommended improvements:

- Prevent likes from going below zero.
- Validate that the liked post belongs to the active creator.
- Avoid trusting only client-side `likedPosts` state.
- Make view tracking update the specific content page being viewed, not just any page matching the creator.
- Consider rate limiting viewer interactions.

### 8. Clarify Publish/Schedule Rules

The app currently treats posts as published/scheduled based on `publishDate`.

Recommended documentation and tests:

- A post with `publishDate` in the future is scheduled.
- A post with `publishDate` in the past is published.
- Public viewer queries should only return posts where `publishDate <= now`.
- Decide whether drafts should exist in the future.

This should be documented clearly because earlier versions of the project used a `status` field differently.

### 9. Add Validation and User-Friendly Error Handling

Recommended validation areas:

- Required fields for creating users.
- Valid email format.
- Password length/strength.
- Max file size.
- Allowed media MIME types.
- Valid publish dates.
- Valid brand colors.
- Creator profile field length limits.

Most validation should happen server-side, with friendly errors rendered back into the current page.

### 10. Improve File Storage Strategy for Production

The current local `storage/` folder is practical for development, but production deployments usually need persistent object storage.

Recommended production path:

- Move file storage to S3, Cloudflare R2, Azure Blob Storage, or similar.
- Keep the `FileService` abstraction so controllers do not care where files live.
- Store only file keys and metadata in MongoDB.
- Add cleanup tools for orphaned files.

## Lower Priority Improvements

### 11. Standardize TypeScript and Module Usage

The project mixes `.ts` and `.js` files and uses both ES imports and CommonJS exports. This works in places, but it increases maintenance overhead.

Recommended direction:

- Move route and middleware files to TypeScript over time.
- Use one module style consistently.
- Add missing type packages where needed.
- Fix `req.user` typing so `npx tsc --noEmit` can become a reliable check.

### 12. Add a Real Test Script

The current `npm test` script points to `src/test.js`, while the repository contains `src/test.ts`. That script also appears to be a file-storage smoke script rather than a full test suite.

Recommended:

- Replace `npm test` with a real test runner command.
- Keep file-storage smoke tests separate from automated unit/integration tests.

Example future scripts:

```json
"test": "vitest run",
"test:e2e": "playwright test",
"typecheck": "tsc --noEmit"
```

### 13. Add Deployment Documentation

Sponsors and future maintainers would benefit from a deployment checklist.

Include:

- Required environment variables.
- MongoDB setup.
- Session secret and CSRF secret setup.
- Storage location and backup plan.
- Admin account creation.
- How to run behind a reverse proxy.
- Production logging location.
- How to restart the app.

### 14. Add Database Index Review

Recommended indexes:

- `User.email`
- `CreatorProfile.userId`
- `CreatorProfile.creatorSlug`
- `ContentPage.creatorId`
- `ContentPage.publishDate`
- `File.fileKey`
- `File.ownerId`

Indexes should be reviewed with the expected query patterns, especially for public content hub loading.

## Areas That Might Be Broken or Fragile

These areas deserve manual verification before final handoff:

- Fresh setup from `.env.example`.
- `npm run dev` and `npm start` paths.
- Login with CSRF enabled.
- All POST forms include `_csrf`.
- Media upload and delete in creator editor.
- Creator post deletion cleans up uploaded media.
- Admin creator deletion does not leave orphaned content/media.
- Content hub with two different creators open at once.
- Content hub with multiple viewers connected at once.
- Like/unlike behavior across refreshes and browsers.
- Scheduled posts becoming visible at the expected time.
- Disabled creator account public hub behavior.
- Production logging path creation.

## Suggested Final Manual Test Checklist

Before presenting or delivering the project, manually run through:

1. Start the app from a clean `.env`.
2. Create or seed an admin account.
3. Log in as admin.
4. Create a creator account.
5. Log out and log in as the creator.
6. Edit the creator profile and upload a profile image.
7. Create a post.
8. Edit the post and confirm the saved banner appears.
9. Upload media to the post.
10. Replace the media and confirm old media is removed.
11. Delete the post and confirm media is removed.
12. Create enough posts to confirm the 25-post limit behavior.
13. Visit the public content hub as a viewer.
14. Like a post.
15. Confirm analytics change in the creator dashboard.
16. Disable the creator account as admin.
17. Confirm the public content hub no longer appears.

## Recommended Commit/Project Hygiene

Before final handoff:

- Keep documentation files in the repo root or a dedicated `docs/` folder.
- Make sure README links to the most important documentation.
- Keep `.env.example` complete and safe.
- Ensure `npm run dev` works from a fresh clone.
- Add at least one automated smoke test.
- Avoid leaving branches with unrelated experiments mixed together.

## Suggested Next Development Order

If there is limited time, work in this order:

1. Fix config/startup issues.
2. Fix content hub Socket.IO room/broadcast behavior.
3. Add ownership checks to media upload/update paths.
4. Verify and fix account deletion cleanup.
5. Add a smoke/integration test for login, post creation, post edit, and post delete.
6. Add deployment documentation.
7. Refactor controller business logic into services.

